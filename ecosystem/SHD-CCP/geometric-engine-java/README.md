# SHD-CCP / geometric-engine-java

**Layer 2: Java 21+ / JVM binding** of the SHD-CCP Geometric Engine. Publishes to **Maven Central (`io.github.shd-ccp:geometric-engine`)**.

```text
SHD-CCP Spec v0.1.0: CONFORMANT
```

## Implemented

| Primitive | RFC | Vectors |
| :--- | :---: | :--- |
| 64-bit Einstein Tile codec (draft layout) | 01 | `einstein_tiles_forms_0_15` |
| Garner CRT (881, 883, 887) | 02 | `garner_crt_881_883_887` |
| Exact 128-bit Gram-TQF collinearity | 02 | `gram_tqf_collinearity` |

## Install

```xml
<dependency>
  <groupId>io.github.shd-ccp</groupId>
  <artifactId>geometric-engine</artifactId>
  <version>0.1.0</version>
</dependency>
```

## Test and conformance

[`geometric-engine-spec`](https://github.com/SHD-CCP/geometric-engine-spec) is mounted as a submodule at `./spec`:

```sh
git submodule update --init
mvn test        # or: mvn test -Dge.spec.dir=/path/to/geometric-engine-spec
```

The runner also accepts `$GE_SPEC_DIR`, or a sibling `../geometric-engine-spec` checkout.

## Roadmap

- Stateful `TqfStreamPruner` and QCC operators
- Apache Kafka Streams and Apache Flink adapters
- Value-class `EinsteinTile` once Valhalla lands
