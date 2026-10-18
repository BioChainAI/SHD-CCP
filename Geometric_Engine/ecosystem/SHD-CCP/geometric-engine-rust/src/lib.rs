//! SHD-CCP Geometric Engine — Rust binding.
//!
//! Builds `no_std` with `default-features = false`; every primitive here is allocation-free.
#![cfg_attr(not(feature = "std"), no_std)]

pub mod crt;
pub mod tile;
pub mod tqf;

pub use tile::EinsteinTile;

/// Version of geometric-engine-spec this crate is certified against.
pub const SPEC_VERSION: &str = "0.1.0";
