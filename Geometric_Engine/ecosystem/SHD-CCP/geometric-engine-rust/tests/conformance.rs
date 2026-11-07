//! Runs the crate against every suite in geometric-engine-spec/test_vectors/.
//!
//! The suites are discovered from the `.json` files in test_vectors/ (CONFORMANCE.md): each
//! file's `suite` and `status` are read, a suite with a handler below runs against its SHDGEV01
//! `.bin` mirror, a normative suite without a handler fails, a draft suite without a handler is
//! reported as skipped, and a pending suite is skipped. A handler whose suite is missing fails.
//!
//! Spec location: $GE_SPEC_DIR, ./spec (submodule), or ../geometric-engine-spec.

use std::path::{Path, PathBuf};

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

fn load(dir: &Path, suite: &str, fields: usize) -> Vec<Vec<u64>> {
    let path = dir.join(format!("{suite}.bin"));
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

fn einstein_tiles_forms_0_15(dir: &Path) {
    for r in load(dir, "einstein_tiles_forms_0_15", 4) {
        let t = EinsteinTile(r[0]);
        assert_eq!(t.form_id() as u64, r[1], "tile {:#018x}", r[0]);
        assert_eq!(t.south_halo() as u64, r[2], "tile {:#018x}", r[0]);
        assert_eq!(t.payload(), r[3], "tile {:#018x}", r[0]);
    }
}

fn garner_crt_881_883_887(dir: &Path) {
    for r in load(dir, "garner_crt_881_883_887", 4) {
        let res = [r[1] as u16, r[2] as u16, r[3] as u16];
        assert_eq!(crt::encode(r[0] as u32), Some(res), "n = {}", r[0]);
        assert_eq!(crt::decode(res), Some(r[0] as u32), "residues {res:?}");
    }
}

fn gram_tqf_collinearity(dir: &Path) {
    for r in load(dir, "gram_tqf_collinearity", 9) {
        let p = |i: usize| (r[i] as i64, r[i + 1] as i64);
        let want = (r[7] as u128) << 64 | r[6] as u128;
        assert_eq!(tqf::gram_tqf(p(0), p(2), p(4)), want, "case {r:?}");
        assert_eq!(tqf::is_collinear(p(0), p(2), p(4)), r[8] != 0);
    }
}

const HANDLERS: &[(&str, fn(&Path))] = &[
    ("einstein_tiles_forms_0_15", einstein_tiles_forms_0_15),
    ("garner_crt_881_883_887", garner_crt_881_883_887),
    ("gram_tqf_collinearity", gram_tqf_collinearity),
];

/// Reads a top-level string member of a suite envelope. Only the text before the `"cases"`
/// member is searched, so a key inside a case object is never taken for an envelope key.
fn envelope_string(json: &str, key: &str) -> Option<String> {
    let head = &json[..json.find("\"cases\"").unwrap_or(json.len())];
    let quoted = format!("\"{key}\"");
    let mut from = 0;
    while let Some(i) = head[from..].find(&quoted).map(|i| i + from) {
        from = i + quoted.len();
        let before = head[..i].trim_end();
        if !(before.ends_with('{') || before.ends_with(',')) {
            continue;
        }
        let rest = head[from..].trim_start().strip_prefix(':')?.trim_start().strip_prefix('"')?;
        let end = rest.find(|c| c == '"' || c == '\\')?;
        return rest[end..].starts_with('"').then(|| rest[..end].to_string());
    }
    None
}

/// Every suite in test_vectors/, as (file name, suite, status), sorted by file name.
fn discover(dir: &Path) -> Vec<(String, Option<(String, String)>)> {
    let mut files: Vec<String> = std::fs::read_dir(dir)
        .unwrap_or_else(|e| panic!("{}: {e}", dir.display()))
        .map(|e| e.unwrap().file_name().to_string_lossy().into_owned())
        .filter(|name| name.ends_with(".json") && name != "schema.json")
        .collect();
    files.sort();
    files
        .into_iter()
        .map(|name| {
            let json = std::fs::read_to_string(dir.join(&name)).unwrap_or_default();
            let envelope = envelope_string(&json, "suite")
                .zip(envelope_string(&json, "status"))
                .filter(|(suite, _)| name.strip_suffix(".json") == Some(suite.as_str()));
            (name, envelope)
        })
        .collect()
}

#[test]
fn every_suite_in_test_vectors() {
    let dir = vectors_dir();
    let mut failures = Vec::new();
    let mut seen = vec![false; HANDLERS.len()];
    for (file, envelope) in discover(&dir) {
        let Some((suite, status)) = envelope else {
            failures.push(format!("{file}: cannot read its suite and status"));
            continue;
        };
        let handler = HANDLERS.iter().position(|(name, _)| *name == suite);
        if let Some(h) = handler {
            seen[h] = true;
        }
        match (handler, status.as_str()) {
            (_, "pending") => println!("{suite}: pending, skipped"),
            (Some(h), _) => {
                let run = HANDLERS[h].1;
                match std::panic::catch_unwind(|| run(&dir)) {
                    Ok(()) => println!("{suite}: pass"),
                    Err(_) => failures.push(format!("{suite}: FAIL (see the panic above)")),
                }
            }
            (None, "draft") => println!("{suite}: no handler for draft suite, skipped"),
            (None, _) => failures.push(format!("{suite}: no handler for {status} suite {suite}")),
        }
    }
    for (h, (suite, _)) in HANDLERS.iter().enumerate() {
        if !seen[h] {
            failures.push(format!("{suite}: not found in {}", dir.display()));
        }
    }
    assert!(failures.is_empty(), "\n{}", failures.join("\n"));
}

#[test]
fn envelope_keys_are_read_from_the_envelope_only() {
    let json = "{\n  \"suite\": \"a_b\",\n  \"description\": \"the \\\"status\\\" key\",\n  \"status\": \"draft\",\n  \"cases\": [{\"status\": \"normative\"}]\n}";
    assert_eq!(envelope_string(json, "suite").as_deref(), Some("a_b"));
    assert_eq!(envelope_string(json, "status").as_deref(), Some("draft"));
    let late = "{\"cases\": [{\"suite\": \"x\"}], \"suite\": \"y\"}";
    assert_eq!(envelope_string(late, "suite"), None);
}
