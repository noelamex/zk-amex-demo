use poseidon::poseidon2;

global TREE_DEPTH: u32 = 8;

// Encode a date into a single integer so we can compare dates cheaply.
// Layout (bit-style):
//   [ year ... ][ month (4 bits) ][ day (5 bits) ]
//
// We use:
//   code = year * 512 + month * 32 + day
//   - 512 = 2^9
//   - 32  = 2^5

fn encode_date(year: u16, month: u8, day: u8) -> u32 {
    assert(month >= 1);
    assert(month <= 12);

    assert(day >= 1);
    assert(day <= 31);

    let y: u32 = year as u32;
    let m: u32 = month as u32;
    let d: u32 = day as u32;

    y * 512u32 + m * 32u32 + d
}

fn dob_commitment(dob_year: u16, dob_month: u8, dob_day: u8) -> Field {
    let y: Field = dob_year.into();
    let m: Field = dob_month.into();
    let d: Field = dob_day.into();

    poseidon2::Poseidon2::hash([y, m, d], 3)
}

fn merkle_hash(left: Field, right: Field) -> Field {
    poseidon2::Poseidon2::hash([left, right], 2)
}

fn compute_merkle_root(
    leaf: Field,
    path: [Field; TREE_DEPTH],
    index: u32,
) -> Field {
    let mut hash = leaf;
    let mut idx: u32 = index;

    for i in 0..TREE_DEPTH {
        let sibling = path[i];

        // low bit decides left/right
        let is_right: u32 = idx & 1;

        if is_right == 0 {
            hash = merkle_hash(hash, sibling);
        } else {
            hash = merkle_hash(sibling, hash);
        }

        idx = idx >> 1;
    }

    hash
}

fn main(
    // Private witness inputs
    dob_year: u16,
    dob_month: u8,
    dob_day: u8,

    // Public verifier inputs
    cutoff_year: pub u16,
    cutoff_month: pub u8,
    cutoff_day: pub u8,

    challenge: pub Field,
    context: pub Field,

    dob_commit: pub Field,

    active_root: pub Field,
    active_leaf: Field,
    active_path: [Field; TREE_DEPTH],
    active_index: u32,
) {
    let dob_code = encode_date(dob_year, dob_month, dob_day);
    let cutoff_code = encode_date(cutoff_year, cutoff_month, cutoff_day);
    assert(dob_code <= cutoff_code, "age check failed");

    let expected = dob_commitment(dob_year, dob_month, dob_day);
    assert(expected == dob_commit, "dob_commit mismatch");

    // Membership proof: active_leaf is in tree with root active_root
    let computed_root = compute_merkle_root(
        active_leaf,
        active_path,
        active_index
    );
    assert(computed_root == active_root);
    // Bind membership leaf to the credential commitment
    assert(active_leaf == dob_commit);
    // (optional) range assert
    assert(active_index < (1 << TREE_DEPTH) as u32);
}
