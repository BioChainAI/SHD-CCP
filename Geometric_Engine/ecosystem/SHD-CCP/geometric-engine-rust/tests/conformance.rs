//! Runs the crate against geometric-engine-spec/test_vectors/*.bin (SHDGEV01).
//!
//! Spec location: $GE_SPEC_DIR, ./spec (submodule), or ../geometric-engine-spec.

use std::path::PathBuf;

use geometric_engine::{crt, tqf, EinsteinTile};

fn vectors_dir() -> PathBuf {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    std::env::var_os("GE_SPEC_DIR")
        .map(PathBuf::from)
        .into_iter()
        .chain([root.join("spec"), root.join("../geometric-engine-spec")])
        .map(|p| p.join("test_vectors"))
        .find(|p| p.is_dir())
        .expect("geometric-engine-spec not found (set GE_SPEC_DIR or add the spec submodule at ./spec)")
}

fn load(suite: &str, fields: usize) -> Vec<Vec<u64>> {
    let path = vectors_dir().join(format!("{suite}.bin"));
    let raw = std::fs::read(&path).unwrap_or_else(|e| panic!("{}: {e}", path.display()));
    assert_eq!(&raw[..8], b"SHDGEV01", "{}: bad magic", path.display());
    let f = u32::from_le_bytes(raw[8..12].try_into().unwrap()) as usize;
    let n = u32::from_le_bytes(raw[12..16].try_into().unwrap()) as usize;
    assert_eq!(f, fields, "{suite}: field count");
    assert_eq!(raw.len(), 16 + 8 * f * n, "{suite}: length");
    raw[16..]
        .chunks_exact(8)
        .map(|c| u64::from_le_bytes(c.try_into().unwrap()))
        .collect::<Vec<_>>()
        .chunks_exact(f)
        .map(<[u64]>::to_vec)
        .collect()
}

#[test]
fn einstein_tiles_forms_0_15() {
    for r in load("einstein_tiles_forms_0_15", 4) {
        let t = EinsteinTile(r[0]);
        assert_eq!(t.form_id() as u64, r[1], "tile {:#018x}", r[0]);
        assert_eq!(t.south_halo() as u64, r[2], "tile {:#018x}", r[0]);
        assert_eq!(t.payload(), r[3], "tile {:#018x}", r[0]);
    }
}

#[test]
fn garner_crt_881_883_887() {
    for r in load("garner_crt_881_883_887", 4) {
        let res = [r[1] as u16, r[2] as u16, r[3] as u16];
        assert_eq!(crt::encode(r[0] as u32), Some(res), "n = {}", r[0]);
        assert_eq!(crt::decode(res), Some(r[0] as u32), "residues {res:?}");
    }
}

#[test]
fn gram_tqf_collinearity() {
    for r in load("gram_tqf_collinearity", 9) {
        let p = |i: usize| (r[i] as i64, r[i + 1] as i64);
        let want = (r[7] as u128) << 64 | r[6] as u128;
        assert_eq!(tqf::gram_tqf(p(0), p(2), p(4)), want, "case {r:?}");
        assert_eq!(tqf::is_collinear(p(0), p(2), p(4)), r[8] != 0);
    }
}
