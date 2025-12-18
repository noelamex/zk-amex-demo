use poseidon::poseidon2;

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
) {
    let dob_code = encode_date(dob_year, dob_month, dob_day);
    let cutoff_code = encode_date(cutoff_year, cutoff_month, cutoff_day);
    assert(dob_code <= cutoff_code);

    let expected = dob_commitment(dob_year, dob_month, dob_day);
    assert(expected == dob_commit);
}
