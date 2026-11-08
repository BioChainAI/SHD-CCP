/***********************************************************************
         * 1. GLOBAL STATE & CONCEPT SEEDS (64-BIT BIG-ENDIAN SPLIT INTO 4x16b)
         ***********************************************************************/
        // We store each 64-bit register as four 16-bit unsigned slabs: [Z3, Z2, Z1, Z0]
        const CONCEPT_PRESETS = {
            cat:         { label: '"cat"',         slabs: [0xF942, 0x6A01, 0x8520, 0x0012], theta: 42,  phi: 18 },
            dog:         { label: '"dog"',         slabs: [0xF942, 0x6A01, 0x8520, 0x0018], theta: 42,  phi: 24 },
            wolf:        { label: '"wolf"',        slabs: [0xF942, 0x6A01, 0x8522, 0x0038], theta: 44,  phi: 56 },
            car:         { label: '"car"',         slabs: [0x3180, 0x9104, 0x11B0, 0x00C4], theta: 215, phi: 196 },
            fpga_tensor: { label: 'TTP Float (3)', slabs: [0x3154, 0x3001, 0x4248, 0x0000], theta: 90,  phi: 45 }
        };

        let currentSlabs = [0xF942, 0x6A01, 0x8520, 0x0012]; // Default: "cat"
        let currentFpgaMode = 'toroidal';
        let activeSlabFilter = 'all';

        const FPGA_MODE_SPECS = {
            toroidal: {
                badge: 'Form ID 12–15 • Toroidal Ontology Mode',
                slabs: [
                    { z: 3, range: '[63:48]', title: 'Quaternionic Core (Q)', desc: 'Macro ontological hyper-octant & spinor frame', color: 'cyan' },
                    { z: 2, range: '[47:32]', title: 'Trefoil Knot Pairing (K)', desc: 'Form ID [47:44] + relational chirality & valence', color: 'purple' },
                    { z: 1, range: '[31:16]', title: 'Meso-Toroidal Orbit (Θ)', desc: 'Major ring angle via CRT prime residues', color: 'emerald' },
                    { z: 0, range: '[15:00]', title: 'Poloidal Fine Spin (Φ)', desc: 'High-frequency minor-ring delta ("cat" vs "dog")', color: 'amber' }
                ]
            },
            ttp_mode_a: {
                badge: 'Form ID 3 • TTP Mode A (Lossless Float)',
                slabs: [
                    { z: 3, range: '[63:48]', title: 'FP16 Residual Delta (f_delta)', desc: 'Exact precision loss: f_orig - f_coarse', color: 'cyan' },
                    { z: 2, range: '[47:32]', title: 'Form ID = 3 & Scale Parity', desc: 'Selects TTP Mode A lossless reconstruction', color: 'purple' },
                    { z: 1, range: '[31:16]', title: 'Quaternion [w, x] (2×FP8)', desc: 'Coarse FP8 tensor components w and x', color: 'emerald' },
                    { z: 0, range: '[15:00]', title: 'Quaternion [y, z] (2×FP8)', desc: 'Coarse FP8 tensor components y and z', color: 'amber' }
                ]
            },
            ttp_mode_b: {
                badge: 'Form ID 4–11 • TTP Mode B (Grand Codex)',
                slabs: [
                    { z: 3, range: '[63:48]', title: 'Sub-Region & Amplitude', desc: 'Local facet nuance & parity verification', color: 'cyan' },
                    { z: 2, range: '[47:32]', title: 'Grand Codex Shape ID', desc: 'Selects canonical polyhedron (e.g. Shape 8)', color: 'purple' },
                    { z: 1, range: '[31:16]', title: 'Polyhedral Face Pointer', desc: 'O(1) lookup index for concept facet', color: 'emerald' },
                    { z: 0, range: '[15:00]', title: 'Vertex & Orientation ID', desc: 'Exact rotational vertex lock in Codex', color: 'amber' }
                ]
            },
            cymatic: {
                badge: 'Form ID 0–2 • Cymatic Subsumption Cascade',
                slabs: [
                    { z: 3, range: '[63:48]', title: 'Shape Power & Triad Seed', desc: 'Controls 0°, +120°, -120° 4-Helix Governors', color: 'cyan' },
                    { z: 2, range: '[47:32]', title: 'TQF Torsion & Tension (τ)', desc: 'Drives Meso Stargate Triple Quad Formula sieve', color: 'purple' },
                    { z: 1, range: '[31:16]', title: 'Agent A Master Clock (ω)', desc: 'derivedMacroFreq phase anchor for singularity', color: 'emerald' },
                    { z: 0, range: '[15:00]', title: 'Zeta-Pole Scalar Return (ΔT)', desc: 'Residual error from (3,7) Torus Knot collision', color: 'amber' }
                ]
            }
        };

        /***********************************************************************
         * 2. MODULE 00: 7-STAGE PIPELINE TRACER
         ***********************************************************************/
        const PIPELINE_STAGES = [
            {
                step: 1,
                short: '01. Ingest',
                title: '1. Symbolic or Tensor Ingestion (Bypassing Raw ASCII)',
                hw: 'Target: SHD-CCP Compiler / Grand Codex Encoder',
                desc: 'Instead of slicing text into arbitrary sub-word tokens or raw 1960s ASCII bytes, the encoder identifies either the concept’s invariant structural coordinates in the Grand Codex OR slices a 4D tensor into a Quad-Slice v = [w, x, y, z].',
                takeaway: 'Key Takeaway: We eliminate the "Alphabetical Phonebook" scrambling tax before a single bit hits the compute engine.',
                code: `// Input Concept: "cat" vs "dog"\n// Legacy ASCII: "cat" = 0x636174, "dog" = 0x646F67 (9 bits apart, random)\n// SHD-CCP Compiler Output:\nuint64_t seed_cat = 0xF9426A0185200012ULL;\nuint64_t seed_dog = 0xF9426A0185200018ULL;`
            },
            {
                step: 2,
                short: '02. Pseudo-FPGA',
                title: '2. Pseudo-FPGA 64-Bit Register Allocation (Form ID Routing)',
                hw: 'Target: 4×16-Bit Nibble-Aligned Register File',
                desc: 'The 64-bit register acts as a polymorphic pseudo-FPGA. Using the 4-bit Form ID routing nibble, hardware knows whether the four 16-bit slabs represent Toroidal Ontology (Form 12–15), Lossless FP8+FP16 Tensor Transfer (Form 3), Grand Codex Polyhedra (Form 4–11), or Cymatic Wave Parameters (Form 0–2).',
                takeaway: 'Key Takeaway: Strict 16-bit Z-slab boundaries ensure 100% backward compatibility across all operational modes.',
                code: `struct ShdCcpRegister64 {\n  uint16_t z3_upper; // [63:48] Quat Core / FP16 Delta\n  uint16_t z2_midhi; // [47:32] Form ID + Trefoil / Codex Shape\n  uint16_t z1_midlo; // [31:16] Major Orbit Theta / Agent A Freq\n  uint16_t z0_lower; // [15:00] Minor Spin Phi / Zeta Return dT\n};`
            },
            {
                step: 3,
                short: '03. 4×4×4 Cube',
                title: '3. Bijective 4×4×4 Voxel Lattice & 8 Ghost Cubes (Z₄³ Ring)',
                hw: 'Target: 3D Spatial LUT & 2D Planar Slab Kernels',
                desc: 'Because 4 × 4 × 4 = 64, bit index i ∈ [0,63] maps bijectively to 3D coordinate (x,y,z) ∈ {0,1,2,3}³ via base-4 decomposition. The primary cube is surrounded by 8 bounding Ghost Cubes that enforce modular wrap-around (x ± 1 mod 4) without edge clipping.',
                takeaway: 'Key Takeaway: Every 16-bit slab is a physical 4×4 horizontal Z-layer, allowing 2D geometric kernels to execute in 1 cycle.',
                code: `// Base-4 Bijection: bit_index = 16*z + 4*y + x\ninline int coordToBit(int x, int y, int z) {\n  return ((z & 3) << 4) | ((y & 3) << 2) | (x & 3);\n}\n// Applying 2D Inner Core Kernel (0x0660) to Slab Z=3:\nreg.z3_upper ^= 0x0660;`
            },
            {
                step: 4,
                short: '04. Torus Pump',
                title: '4. Toroidal Manifold Projection & 720:1 Spinor Pathing',
                hw: 'Target: Torsional Markov Pump (T² Manifold)',
                desc: 'The discrete 4×4×4 cube projects onto a continuous torus T² = S¹ × S¹. Slab Z=1 sets the major toroidal angle Θ (ontological family), while Slab Z=0 sets the minor poloidal angle Φ (fine variation). State transitions flow along Frenet-Serret helical geodesics.',
                takeaway: 'Key Takeaway: "cat" and "dog" share Θ = 42° on the major ring and differ only by ΔΦ = 6° on the minor poloidal ring.',
                code: `// Toroidal Projection from 64-bit Register:\ndouble Theta = ((reg >> 16) & 0xFFFF) * (2.0 * M_PI / 65536.0);\ndouble Phi   = (reg & 0xFFFF) * (2.0 * M_PI / 65536.0);\n// "cat" vs "dog": ΔTheta = 0.000 rad, ΔPhi = 0.104 rad (6 deg)`
            },
            {
                step: 5,
                short: '05. Cymatic',
                title: '5. 4-Phase Cymatic Cascade & Tri-Tier Governance',
                hw: 'Target: GPU Vertex Shaders & (3,7) Torus Knot Core',
                desc: 'Three Micro-Agents (A: 0° Master Clock, B: +120°, C: -120°) project the seed into 3D waves, governed by the Meso TQF Sieve triangle and bounced orthogonally via qTri() inside the 4×4×4 Macro Manhattan L1 matrix before colliding at the central (3,7) Torus Knot.',
                takeaway: 'Key Takeaway: Symmetric forward (+ω) and inverse (-ω) streams annihilate to ΔT = 0; any skew returns up the Zeta-Pole.',
                code: `// Tri-Tier Equilibrium Check at Zero-Point (0,0,0):\nconst double derivedMacroFreq = state.agents.A.frequency;\ndouble tqfSkew = abs(T_A - T_B) + abs(T_B - T_C) + abs(T_C - T_A);\nuint16_t delta_T = (tqfSkew == 0) ? 0 : quantizeError(tqfSkew);`
            },
            {
                step: 6,
                short: '06. LPF+Falcon',
                title: '6. 128-Bit LPF Encapsulation & Post-Quantum Falcon Chaining',
                hw: 'Target: Network Phy / Falcon-512 & Falcon-1024 Signer',
                desc: 'The 64-bit core register is framed by a 32-bit Header and 32-bit CRC32 Footer to form a 16-Byte (128-bit) Logical Packet Frame (LPF). It is then cryptographically chained using post-quantum Falcon-512 (1,348 B chained) or Falcon-1024 (2,576 B chained).',
                takeaway: 'Key Takeaway: At 1 Gbps, Chained-512 transmits in 10.78 μs (92,730 packets/sec)—nearly 1,000× faster than the 10ms target.',
                code: `// Logical Packet Frame (LPF = 16 Bytes / 128 Bits)\nstruct LPF_128 {\n  uint32_t header_meta;  // 4 Bytes (Routing / Version)\n  uint64_t shd_ccp_core; // 8 Bytes (64-Bit Cubic Register)\n  uint32_t crc32_footer; // 4 Bytes (Hardware Integrity)\n}; // + Falcon-512 Sig (666B) + PrevSig (666B) = 1,348 Bytes`
            },
            {
                step: 7,
                short: '07. O(1) ALU',
                title: '7. Single-Cycle O(1) Hardware ALU Execution',
                hw: 'Target: Standard 64-Bit CPU / FPGA ALU Register',
                desc: 'At the receiving node, computing semantic similarity or reconstructing lossless tensors requires zero matrix multiplications. A single 64-bit bitwise XOR followed by POPCNT measures exact topological distance across any hierarchy tier in 1 CPU clock cycle.',
                takeaway: 'Key Takeaway: Emergence is no longer brute-forced at runtime because the 64-bit integer itself is strictly geometric.',
                code: `// Single-Cycle O(1) Semantic Similarity in Hardware:\nuint64_t diff = seed_cat ^ seed_dog; // 0x0000_0000_0000_000A\nint macro_dist = __builtin_popcountll(diff & 0xFFFFFFFFFFFF0000ULL); // 0!\nint fine_dist  = __builtin_popcountll(diff & 0x000000000000FFFFULL); // 2 bits`
            }
        ];

        let currentPipelineIdx = 0;

        function renderPipelineStage() {
            const pillsContainer = document.getElementById('pipeline-pills');
            if (!pillsContainer) return;

            pillsContainer.innerHTML = PIPELINE_STAGES.map((st, idx) => {
                const active = idx === currentPipelineIdx;
                return `<button type="button" onclick="setPipelineStage(${idx})" aria-current="${active ? 'step' : 'false'}" class="p-2.5 rounded-xl text-left font-mono text-xs border transition cursor-pointer ${
                    active
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }">
                    <div class="text-[10px] ${active ? 'text-cyan-300' : 'text-slate-500'}">STEP 0${st.step}</div>
                    <div class="font-bold truncate mt-0.5">${st.short}</div>
                </button>`;
            }).join('');

            const stage = PIPELINE_STAGES[currentPipelineIdx];
            const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
            setTxt('pipe-stage-badge', `STAGE ${stage.step} OF 7`);
            setTxt('pipe-stage-hw', stage.hw);
            setTxt('pipe-stage-title', stage.title);
            setTxt('pipe-stage-desc', stage.desc);
            setTxt('pipe-stage-takeaway', stage.takeaway);
            setTxt('pipe-stage-code', stage.code);
        }

        function setPipelineStage(idx) {
            currentPipelineIdx = idx;
            renderPipelineStage();
        }

        function stepPipeline(delta) {
            currentPipelineIdx = (currentPipelineIdx + delta + PIPELINE_STAGES.length) % PIPELINE_STAGES.length;
            renderPipelineStage();
        }

        /***********************************************************************
         * 3. MODULE 01: ASCII TRAP INTERACTIVE LAB
         ***********************************************************************/
        const ASCII_PAIRS = {
            cat_dog: {
                labelA: '"cat"', bitsA: '01100011 01100001 01110100 (0x636174)',
                labelB: '"dog"', bitsB: '01100100 01101111 01100111 (0x646F67)',
                hamming: '9 bits flipped (Zero shared letters)',
                asciiVerdict: 'High Entropy Scrambling',
                asciiExp: 'In raw ASCII, "cat" and "dog" share zero characters in position and differ by 9 bits. A neural network fed raw ASCII must spend massive parameter layers unlearning this arbitrary spelling difference.',
                shdHexA: '0xF942_6A01_8520_0012',
                shdHexB: '0xF942_6A01_8520_0018',
                shdXor: '0x0000_0000_0000 (100% Match in Upper 48b!)',
                shdVerdict: 'Identical Major Orbit (Θ=42°)',
                shdExp: 'In SHD-CCP, "cat" and "dog" share the exact same Quaternionic Core (0xF942), Trefoil Pairing (0x6A01), and Meso-Toroidal Orbit (0x8520). Only 2 bits differ in the lower 16-bit Poloidal Spin slab!'
            },
            cat_car: {
                labelA: '"cat"', bitsA: '01100011 01100001 01110100 (0x636174)',
                labelB: '"car"', bitsB: '01100011 01100001 01110010 (0x636172)',
                hamming: 'Only 2 bits flipped! (Deceptive Trap)',
                asciiVerdict: 'Deceptive Bit Proximity',
                asciiExp: 'Because "cat" and "car" share the letters "c-a-", their raw ASCII binary differs by only 2 bits! A byte-level model starts with the false assumption that a feline and an automobile are nearly identical.',
                shdHexA: '0xF942_6A01_8520_0012',
                shdHexB: '0x3180_9104_11B0_00C4',
                shdXor: '0xC8C2_FB05_9490 (19 Macro Bits Flipped)',
                shdVerdict: 'Antipodal Orbits (ΔΘ=173°)',
                shdExp: 'SHD-CCP places "cat" (living mammal) and "car" (mechanical vehicle) in opposite octants of the 4×4×4 cube and antipodal rings on the torus. A single hardware XOR immediately separates them.'
            },
            gold_silver: {
                labelA: '"Gold"', bitsA: '01000111 01101111 01101100 01100100',
                labelB: '"Silver"', bitsB: '01010011 01101001 01101100 01110110...',
                hamming: '14+ bits flipped (Filed by Spelling)',
                asciiVerdict: 'Alphabetical Phonebook',
                asciiExp: 'In an alphabetical phonebook, "Gold" sits next to "Gadolinium" and "Silver" sits next to "Silicon". Spelling hides the fact that both are Group 11 coinage metals with d10s1 valence shells.',
                shdHexA: '0xD41B_8820_4C10_002A',
                shdHexB: '0xD41B_8820_4C10_001A',
                shdXor: '0x0000_0000_0000 (Identical Group 11 Track)',
                shdVerdict: '3D Periodic Table Orbit',
                shdExp: 'Just like the Periodic Table aligns Copper, Silver, and Gold in a single column, SHD-CCP stamps their shared conductivity and valence geometry into bits [63:16], varying only the period spin in [15:00].'
            }
        };

        function selectAsciiPair(key) {
            const p = ASCII_PAIRS[key];
            if (!p) return;
            ['cat_dog', 'cat_car', 'gold_silver'].forEach(k => {
                const btn = document.getElementById('pair-btn-' + k);
                if (btn) {
                    btn.className = (k === key)
                        ? 'px-3 py-1.5 rounded-xl text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-pointer'
                        : 'px-3 py-1.5 rounded-xl text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer';
                }
            });
            const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
            setTxt('ascii-label-a', p.labelA);
            setTxt('ascii-bits-a', p.bitsA);
            setTxt('ascii-label-b', p.labelB);
            setTxt('ascii-bits-b', p.bitsB);
            setTxt('ascii-hamming', p.hamming);
            setTxt('ascii-verdict-badge', p.asciiVerdict);
            setTxt('ascii-explanation', p.asciiExp);

            setTxt('shd-label-a', p.labelA);
            setTxt('shd-hex-a', p.shdHexA);
            setTxt('shd-label-b', p.labelB);
            setTxt('shd-hex-b', p.shdHexB);
            setTxt('shd-upper-xor', p.shdXor);
            setTxt('shd-verdict-badge', p.shdVerdict);
            setTxt('shd-explanation', p.shdExp);
        }

        /***********************************************************************
         * 4. MODULE 02: 64-BIT CUBIC REGISTER, PSEUDO-FPGA & 2D KERNEL DESIGNER
         ***********************************************************************/
        function getBit(bitIndex) {
            const slabIdx = 3 - Math.floor(bitIndex / 16); // Z=3 is slabs[0], Z=0 is slabs[3]
            const offset = bitIndex % 16;
            return (currentSlabs[slabIdx] >> offset) & 1;
        }

        function toggleBit(bitIndex) {
            const slabIdx = 3 - Math.floor(bitIndex / 16);
            const offset = bitIndex % 16;
            currentSlabs[slabIdx] ^= (1 << offset);
            currentSlabs[slabIdx] &= 0xFFFF;
            const active = document.activeElement;
            const grid = active && active.closest('#bit-grid-container, #planar-slabs-container');
            refreshAllRegisterViews();
            if (grid) {
                const replacement = grid.querySelector('[data-bit-index="' + bitIndex + '"]');
                if (replacement) replacement.focus({ preventScroll: true });
            }
        }

        function formatHex16(v) {
            return (v & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
        }

        function setFpgaMode(modeKey) {
            if (!FPGA_MODE_SPECS[modeKey]) return;
            currentFpgaMode = modeKey;
            ['toroidal', 'ttp_mode_a', 'ttp_mode_b', 'cymatic'].forEach(k => {
                const btn = document.getElementById('fpga-btn-' + k);
                if (btn) {
                    btn.className = (k === modeKey)
                        ? 'p-3 rounded-xl text-left border transition cursor-pointer bg-cyan-500/15 border-cyan-500/50'
                        : 'p-3 rounded-xl text-left border transition cursor-pointer bg-slate-900/80 border-slate-800 hover:border-slate-700';
                }
            });
            refreshAllRegisterViews();
        }

        function loadConceptPreset(key) {
            const preset = CONCEPT_PRESETS[key];
            if (!preset) return;
            currentSlabs = [...preset.slabs];
            setFpgaMode(key === 'fpga_tensor' ? 'ttp_mode_a' : 'toroidal');
            const thetaSlider = document.getElementById('torus-theta-slider');
            const phiSlider = document.getElementById('torus-phi-slider');
            if (thetaSlider && phiSlider) {
                thetaSlider.value = preset.theta;
                phiSlider.value = preset.phi;
                updateTorusSliders();
            }
            refreshAllRegisterViews();
        }

        function setSlabFilter(filterVal) {
            activeSlabFilter = filterVal;
            update3DCubeVoxels();
        }

        function apply2DKernel(mask16) {
            const targetEl = document.getElementById('kernel-target-slab');
            const opEl = document.getElementById('kernel-op-mode');
            const target = targetEl ? targetEl.value : 'all';
            const op = opEl ? opEl.value : 'write';

            for (let z = 0; z < 4; z++) {
                if (target === 'all' || parseInt(target, 10) === z) {
                    const idx = 3 - z;
                    if (op === 'write') currentSlabs[idx] = mask16 & 0xFFFF;
                    else if (op === 'xor') currentSlabs[idx] = (currentSlabs[idx] ^ mask16) & 0xFFFF;
                    else if (op === 'or')  currentSlabs[idx] = (currentSlabs[idx] | mask16) & 0xFFFF;
                    else if (op === 'and') currentSlabs[idx] = (currentSlabs[idx] & mask16) & 0xFFFF;
                }
            }
            refreshAllRegisterViews();
        }

        function rotate2DSlabs90() {
            const targetEl = document.getElementById('kernel-target-slab');
            const target = targetEl ? targetEl.value : 'all';

            for (let z = 0; z < 4; z++) {
                if (target === 'all' || parseInt(target, 10) === z) {
                    const idx = 3 - z;
                    const oldSlab = currentSlabs[idx];
                    let newSlab = 0;
                    for (let y = 0; y < 4; y++) {
                        for (let x = 0; x < 4; x++) {
                            const oldBit = (oldSlab >> (y * 4 + x)) & 1;
                            const newX = 3 - y;
                            const newY = x;
                            if (oldBit) {
                                newSlab |= (1 << (newY * 4 + newX));
                            }
                        }
                    }
                    currentSlabs[idx] = newSlab & 0xFFFF;
                }
            }
            refreshAllRegisterViews();
        }

        function refreshAllRegisterViews() {
            const hexStr = `0x${formatHex16(currentSlabs[0])}_${formatHex16(currentSlabs[1])}_${formatHex16(currentSlabs[2])}_${formatHex16(currentSlabs[3])}`;
            const hexEl = document.getElementById('live-register-hex');
            if (hexEl) hexEl.textContent = hexStr;

            let pop = 0;
            for (let i = 0; i < 64; i++) pop += getBit(i);
            const popEl = document.getElementById('live-register-popcnt');
            if (popEl) popEl.textContent = `${pop} / 64 bits`;

            // Update FPGA Mode Badge & Slab Cards
            const spec = FPGA_MODE_SPECS[currentFpgaMode];
            const badgeEl = document.getElementById('fpga-active-mode-badge');
            if (badgeEl && spec) badgeEl.textContent = spec.badge;

            const cardsContainer = document.getElementById('fpga-slab-cards');
            if (cardsContainer && spec) {
                cardsContainer.innerHTML = spec.slabs.map((s, idx) => {
                    const hexVal = '0x' + formatHex16(currentSlabs[idx]);
                    const borderMap = {
                        cyan: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300',
                        purple: 'border-purple-500/40 bg-purple-950/20 text-purple-300',
                        emerald: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
                        amber: 'border-amber-500/40 bg-amber-950/20 text-amber-300'
                    };
                    return `<div class="p-3 rounded-xl border ${borderMap[s.color]} space-y-1">
                        <div class="flex items-center justify-between font-mono text-[11px]">
                            <span>Z=${s.z} ${s.range}</span>
                            <span class="font-bold">${hexVal}</span>
                        </div>
                        <div class="text-xs font-bold text-white">${s.title}</div>
                        <div class="text-[11px] text-slate-400">${s.desc}</div>
                    </div>`;
                }).join('');
            }

            renderBitGrid();
            renderPlanarSlabs();
            update3DCubeVoxels();
        }

        function renderBitGrid() {
            const container = document.getElementById('bit-grid-container');
            if (!container) return;

            let html = '';
            for (let b = 63; b >= 0; b--) {
                const val = getBit(b);
                const z = Math.floor(b / 16);
                let activeClass = 'bg-slate-900 text-slate-500 border-slate-800';
                if (val === 1) {
                    if (z === 3) activeClass = 'bg-cyan-500/30 text-cyan-200 border-cyan-400 font-bold';
                    else if (z === 2) activeClass = 'bg-purple-500/30 text-purple-200 border-purple-400 font-bold';
                    else if (z === 1) activeClass = 'bg-emerald-500/30 text-emerald-200 border-emerald-400 font-bold';
                    else activeClass = 'bg-amber-500/30 text-amber-200 border-amber-400 font-bold';
                }
                html += `<button type="button" data-bit-index="${b}" onclick="toggleBit(${b})" aria-label="Bit ${b}, slab Z ${z}" aria-pressed="${val === 1}" title="Bit ${b} (Z=${z})" class="bit-cell h-7 rounded border text-xs font-mono flex items-center justify-center cursor-pointer ${activeClass}">${val}</button>`;
            }
            container.innerHTML = html;
        }

        function renderPlanarSlabs() {
            const container = document.getElementById('planar-slabs-container');
            if (!container) return;

            const slabColors = [
                { z: 3, name: 'Z=3 Top Slab [63:48]', active: 'bg-cyan-500/40 border-cyan-400 text-white', border: 'border-cyan-500/30' },
                { z: 2, name: 'Z=2 Upper-Mid [47:32]', active: 'bg-purple-500/40 border-purple-400 text-white', border: 'border-purple-500/30' },
                { z: 1, name: 'Z=1 Lower-Mid [31:16]', active: 'bg-emerald-500/40 border-emerald-400 text-white', border: 'border-emerald-500/30' },
                { z: 0, name: 'Z=0 Base Slab [15:00]', active: 'bg-amber-500/40 border-amber-400 text-white', border: 'border-amber-500/30' }
            ];

            container.innerHTML = slabColors.map((sc, idx) => {
                const slabVal = currentSlabs[idx];
                let cellsHtml = '';
                for (let y = 3; y >= 0; y--) {
                    for (let x = 0; x < 4; x++) {
                        const bitIndex = sc.z * 16 + y * 4 + x;
                        const bitVal = getBit(bitIndex);
                        const cellCls = bitVal
                            ? `${sc.active} font-bold shadow-sm`
                            : 'bg-slate-900/90 border-slate-800 text-slate-500 hover:border-slate-700';
                        cellsHtml += `<button type="button" data-bit-index="${bitIndex}" onclick="toggleBit(${bitIndex})" aria-label="Bit ${bitIndex}, slab Z ${sc.z}, x ${x}, y ${y}" aria-pressed="${bitVal === 1}" class="h-9 rounded-lg border font-mono text-xs flex flex-col items-center justify-center cursor-pointer transition ${cellCls}">
                            <span>${bitVal}</span>
                            <span class="text-[9px] opacity-60">(${x},${y})</span>
                        </button>`;
                    }
                }
                return `<div class="p-3 rounded-xl bg-black/40 border ${sc.border} space-y-2">
                    <div class="flex items-center justify-between font-mono text-xs">
                        <span class="text-white font-semibold">${sc.name}</span>
                        <span class="text-slate-400">0x${formatHex16(slabVal)}</span>
                    </div>
                    <div class="grid grid-cols-4 gap-1.5">${cellsHtml}</div>
                </div>`;
            }).join('');
        }

        /***********************************************************************
         * 5. THREE.JS SCENE 1: 4x4x4 CUBIC VOXEL LATTICE + 8 GHOST CUBES
         ***********************************************************************/
        let cubeScene, cubeCamera, cubeRenderer, cubeGroup, ghostGroup;
        let cubeAutoRotate = false;
        let showGhostCubes = true;
        const voxelMeshes = [];

        function toggleCubeAutoRotate() {
            cubeAutoRotate = !cubeAutoRotate;
            const btn = document.getElementById('cube-autorotate-btn');
            if (!btn) return;
            if (cubeAutoRotate) {
                btn.textContent = '⟳ Auto-Rotate: ON';
                btn.className = 'px-2.5 py-1 rounded-lg text-[11px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition cursor-pointer';
            } else {
                btn.textContent = '⟳ Auto-Rotate: OFF';
                btn.className = 'px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 transition cursor-pointer';
            }
        }

        function toggleGhostCubes() {
            showGhostCubes = !showGhostCubes;
            if (ghostGroup) ghostGroup.visible = showGhostCubes;
            const btn = document.getElementById('ghost-cubes-btn');
            if (!btn) return;
            btn.textContent = showGhostCubes ? '8 Ghost Cubes: ON' : '8 Ghost Cubes: OFF';
            btn.className = showGhostCubes
                ? 'px-2.5 py-1 rounded-lg text-[11px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition cursor-pointer'
                : 'px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 transition cursor-pointer';
        }

        function init3DCubeScene() {
            const container = document.getElementById('cube-canvas-container');
            if (!container) return;
            if (typeof THREE === 'undefined') {
                container.textContent = '3D rendering is unavailable. The controls and register views remain usable.';
                return;
            }

            const w = container.clientWidth || 500;
            const h = container.clientHeight || 380;

            cubeScene = new THREE.Scene();
            cubeCamera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
            cubeCamera.position.set(6.2, 5.2, 7.2);
            cubeCamera.lookAt(0, 0, 0);

            try {
                cubeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                cubeRenderer.setSize(w, h);
                cubeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
                container.innerHTML = '';
                container.appendChild(cubeRenderer.domElement);
            } catch (e) {
                container.textContent = 'WebGL is unavailable. Use the register views and controls below.';
                return;
            }

            const ambient = new THREE.AmbientLight(0xffffff, 0.75);
            cubeScene.add(ambient);
            const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
            dirLight.position.set(8, 12, 10);
            cubeScene.add(dirLight);

            cubeGroup = new THREE.Group();
            cubeScene.add(cubeGroup);

            // Build 4x4x4 = 64 Voxels
            const spacing = 0.88;
            const offset = 1.5 * spacing;
            const geo = new THREE.BoxGeometry(0.56, 0.56, 0.56);

            voxelMeshes.length = 0;
            for (let b = 0; b < 64; b++) {
                const x = b & 3;
                const y = (b >> 2) & 3;
                const z = (b >> 4) & 3;

                const mat = new THREE.MeshStandardMaterial({
                    color: 0x22d3ee,
                    roughness: 0.25,
                    metalness: 0.3,
                    transparent: true,
                    opacity: 0.9
                });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(x * spacing - offset, z * spacing - offset, y * spacing - offset);
                mesh.userData = { bitIndex: b, zSlab: z };
                cubeGroup.add(mesh);
                voxelMeshes.push(mesh);
            }

            // Build 8 Bounding Ghost Cubes around corners
            ghostGroup = new THREE.Group();
            const ghostGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
            const ghostEdges = new THREE.EdgesGeometry(ghostGeo);
            const ghostMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.28 });

            const corners = [-2.2, 2.2];
            corners.forEach(cx => {
                corners.forEach(cy => {
                    corners.forEach(cz => {
                        const wire = new THREE.LineSegments(ghostEdges, ghostMat);
                        wire.position.set(cx, cy, cz);
                        ghostGroup.add(wire);
                    });
                });
            });
            cubeGroup.add(ghostGroup);

            bindExplainerOrbit(cubeRenderer.domElement, cubeGroup, 'Cubic register visualization. Drag horizontally to rotate; use the bit controls to edit.');

            update3DCubeVoxels();
        }

        function update3DCubeVoxels() {
            if (!voxelMeshes.length) return;
            const zColors = [0xf59e0b, 0x10b981, 0xa855f7, 0x22d3ee]; // Z=0,1,2,3

            for (let b = 0; b < voxelMeshes.length; b++) {
                const mesh = voxelMeshes[b];
                const bitVal = getBit(b);
                const z = mesh.userData.zSlab;
                const matchesFilter = (activeSlabFilter === 'all' || activeSlabFilter === z);

                if (bitVal === 1) {
                    mesh.material.color.setHex(zColors[z]);
                    mesh.material.emissive.setHex(zColors[z]);
                    mesh.material.emissiveIntensity = matchesFilter ? 0.35 : 0.05;
                    mesh.material.opacity = matchesFilter ? 0.95 : 0.15;
                    mesh.scale.setScalar(matchesFilter ? 1.0 : 0.65);
                } else {
                    mesh.material.color.setHex(0x1e293b);
                    mesh.material.emissive.setHex(0x000000);
                    mesh.material.emissiveIntensity = 0;
                    mesh.material.opacity = matchesFilter ? 0.22 : 0.05;
                    mesh.scale.setScalar(0.55);
                }
            }
        }

        /***********************************************************************
         * 6. THREE.JS SCENE 2: TOROIDAL MANIFOLD & TORSIONAL MARKOV PUMP
         ***********************************************************************/
        let torusScene, torusCamera, torusRenderer, torusGroup, helixLine, probeMesh;
        let markovPumpRunning = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let pumpPhase = 0;
        const TORUS_R = 2.85;
        const TORUS_r = 1.05;

        function torusCoords(thetaRad, phiRad, rOffset = 0) {
            const r = TORUS_r + rOffset;
            return new THREE.Vector3(
                (TORUS_R + r * Math.cos(phiRad)) * Math.cos(thetaRad),
                r * Math.sin(phiRad),
                (TORUS_R + r * Math.cos(phiRad)) * Math.sin(thetaRad)
            );
        }

        function init3DTorusScene() {
            const container = document.getElementById('torus-canvas-container');
            if (!container) return;
            if (typeof THREE === 'undefined') {
                container.textContent = '3D rendering is unavailable. The controls and register views remain usable.';
                return;
            }

            const w = container.clientWidth || 600;
            const h = container.clientHeight || 390;

            torusScene = new THREE.Scene();
            torusCamera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
            torusCamera.position.set(0, 5.8, 7.8);
            torusCamera.lookAt(0, 0, 0);

            try {
                torusRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                torusRenderer.setSize(w, h);
                torusRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
                container.innerHTML = '';
                container.appendChild(torusRenderer.domElement);
            } catch (e) {
                container.textContent = 'WebGL is unavailable. Use the register views and controls below.';
                return;
            }

            torusScene.add(new THREE.AmbientLight(0xffffff, 0.8));
            const dLight = new THREE.DirectionalLight(0xffffff, 0.9);
            dLight.position.set(5, 10, 7);
            torusScene.add(dLight);

            torusGroup = new THREE.Group();
            torusScene.add(torusGroup);

            // Wireframe Torus
            const tGeo = new THREE.TorusGeometry(TORUS_R, TORUS_r, 24, 64);
            tGeo.rotateX(Math.PI / 2);
            const tMat = new THREE.MeshBasicMaterial({ color: 0x334155, wireframe: true, transparent: true, opacity: 0.32 });
            torusGroup.add(new THREE.Mesh(tGeo, tMat));

            // Fixed Orbital Markers: "cat", "dog", "car"
            const markers = [
                { theta: 42,  phi: 18,  color: 0x10b981 }, // cat
                { theta: 42,  phi: 24,  color: 0x22d3ee }, // dog
                { theta: 215, phi: 196, color: 0xf59e0b }  // car
            ];
            markers.forEach(m => {
                const pos = torusCoords(m.theta * Math.PI / 180, m.phi * Math.PI / 180, 0.06);
                const sphere = new THREE.Mesh(
                    new THREE.SphereGeometry(0.16, 16, 16),
                    new THREE.MeshBasicMaterial({ color: m.color })
                );
                sphere.position.copy(pos);
                torusGroup.add(sphere);
            });

            // Active Probe Sphere
            probeMesh = new THREE.Mesh(
                new THREE.SphereGeometry(0.2, 20, 20),
                new THREE.MeshBasicMaterial({ color: 0xc084fc })
            );
            torusGroup.add(probeMesh);

            rebuildHelixGeodesic(7);
            updateTorusSliders();

            bindExplainerOrbit(torusRenderer.domElement, torusGroup, 'Toroidal manifold visualization. Drag horizontally to rotate; use the angle sliders to change the probe.');
        }

        function rebuildHelixGeodesic(tauRatio) {
            if (!torusGroup) return;
            if (helixLine) {
                torusGroup.remove(helixLine);
                helixLine.geometry.dispose();
                helixLine.material.dispose();
            }
            const pts = [];
            const steps = 360;
            for (let i = 0; i <= steps; i++) {
                const t = (i / steps) * Math.PI * 2 * 3;
                const phi = t * (tauRatio / 3);
                pts.push(torusCoords(t, phi, 0.03));
            }
            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            const mat = new THREE.LineBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.65 });
            helixLine = new THREE.Line(geo, mat);
            torusGroup.add(helixLine);
        }

        function updateTorusSliders() {
            const thEl = document.getElementById('torus-theta-slider');
            const phEl = document.getElementById('torus-phi-slider');
            const tauEl = document.getElementById('torus-tau-slider');
            if (!thEl || !phEl || !tauEl) return;

            const thDeg = parseFloat(thEl.value);
            const phDeg = parseFloat(phEl.value);
            const tau = parseInt(tauEl.value, 10);

            const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
            setTxt('torus-theta-val', thDeg + '°');
            setTxt('torus-phi-val', phDeg + '°');
            setTxt('torus-tau-val', tau + ':3 Knot');

            rebuildHelixGeodesic(tau);

            if (probeMesh) {
                const pos = torusCoords(thDeg * Math.PI / 180, phDeg * Math.PI / 180, 0.08);
                probeMesh.position.copy(pos);
                setTxt('torus-live-xyz', `Probe XYZ: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`);
            }
        }

        function toggleMarkovPump() {
            markovPumpRunning = !markovPumpRunning;
            const btn = document.getElementById('torus-pump-btn');
            if (btn) {
                btn.textContent = markovPumpRunning ? '⏸ Torsional Markov Pump: RUNNING' : '▶ Torsional Markov Pump: PAUSED';
                btn.setAttribute('aria-pressed', String(markovPumpRunning));
            }
        }

        /***********************************************************************
         * 7. MODULE 04: O(1) HARDWARE ALU COMPARATOR
         ***********************************************************************/
        function popcount16(v) {
            let n = v & 0xFFFF;
            let count = 0;
            while (n) { count += n & 1; n >>= 1; }
            return count;
        }

        function runAluComparison() {
            const selA = document.getElementById('alu-select-a');
            const selB = document.getElementById('alu-select-b');
            const grid = document.getElementById('alu-results-grid');
            if (!selA || !selB || !grid) return;

            const a = CONCEPT_PRESETS[selA.value] || CONCEPT_PRESETS.cat;
            const b = CONCEPT_PRESETS[selB.value] || CONCEPT_PRESETS.dog;

            const xorSlabs = [
                a.slabs[0] ^ b.slabs[0],
                a.slabs[1] ^ b.slabs[1],
                a.slabs[2] ^ b.slabs[2],
                a.slabs[3] ^ b.slabs[3]
            ];
            const macroDist = popcount16(xorSlabs[0]) + popcount16(xorSlabs[1]) + popcount16(xorSlabs[2]);
            const fineDist  = popcount16(xorSlabs[3]);
            const totalDist = macroDist + fineDist;
            const similarityPct = ((64 - totalDist) / 64 * 100).toFixed(1);

            grid.innerHTML = `
                <div class="glass-sub p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div class="text-slate-400">REGISTER A (${a.label})</div>
                    <div class="text-sm font-bold text-cyan-300">0x${formatHex16(a.slabs[0])}_${formatHex16(a.slabs[1])}_${formatHex16(a.slabs[2])}_${formatHex16(a.slabs[3])}</div>
                    <div class="text-slate-400 pt-1">REGISTER B (${b.label})</div>
                    <div class="text-sm font-bold text-purple-300">0x${formatHex16(b.slabs[0])}_${formatHex16(b.slabs[1])}_${formatHex16(b.slabs[2])}_${formatHex16(b.slabs[3])}</div>
                </div>
                <div class="glass-sub p-4 rounded-2xl border border-cyan-500/30 space-y-2">
                    <div class="text-slate-400">SINGLE-CYCLE ALU <code class="text-cyan-300">A ^ B</code> RESULT</div>
                    <div class="text-sm font-bold text-amber-300">0x${formatHex16(xorSlabs[0])}_${formatHex16(xorSlabs[1])}_${formatHex16(xorSlabs[2])}_${formatHex16(xorSlabs[3])}</div>
                    <div class="text-xs text-slate-300 pt-1">Upper 48-Bit Macro/Meso Distance: <strong class="text-emerald-400">${macroDist} bits</strong></div>
                    <div class="text-xs text-slate-300">Lower 16-Bit Poloidal ΔΦ Distance: <strong class="text-cyan-400">${fineDist} bits</strong></div>
                </div>
                <div class="glass-sub p-4 rounded-2xl border border-emerald-500/30 flex flex-col justify-between">
                    <div class="text-slate-400">O(1) TOPOLOGICAL RESONANCE</div>
                    <div class="text-2xl font-extrabold text-emerald-400 my-1">${similarityPct}% Match</div>
                    <div class="text-[11px] text-slate-300">${macroDist === 0 ? '✅ Homologous Toroidal Orbit (Identical Upper 48 Bits)' : '⚠️ Divergent Ontological Manifold Orbit'}</div>
                </div>
            `;
        }

        /***********************************************************************
         * 8. MODULE 05: CYMATIC CASCADE & TQF SIEVE SIMULATOR
         ***********************************************************************/
        function updateCymaticSimulator() {
            const sA = document.getElementById('cym-a-slider');
            const sB = document.getElementById('cym-b-slider');
            const sC = document.getElementById('cym-c-slider');
            if (!sA || !sB || !sC) return;

            const vA = parseInt(sA.value, 10);
            const vB = parseInt(sB.value, 10);
            const vC = parseInt(sC.value, 10);

            const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
            setTxt('cym-a-val', vA);
            setTxt('cym-b-val', vB);
            setTxt('cym-c-val', vC);

            const diff = Math.abs(vA - vB) + Math.abs(vB - vC) + Math.abs(vC - vA);
            const skewPct = (diff / 1.7).toFixed(1);
            const deltaT = Math.round(diff * 1.4);

            setTxt('cym-tqf-skew', `${skewPct}% ${diff === 0 ? '(Symmetric)' : '(Warped TQF)'}`);
            setTxt('cym-delta-t', `ΔT = ${deltaT} ${deltaT === 0 ? '(Crystallized)' : '(Zeta Feedback)'}`);

            const pill = document.getElementById('cym-status-pill');
            if (pill) {
                if (deltaT === 0) {
                    pill.textContent = 'Phase Cancellation: 100% (Equilibrium)';
                    pill.className = 'px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300';
                } else {
                    pill.textContent = `Asymmetric Collision: Routing ΔT=${deltaT}`;
                    pill.className = 'px-2 py-0.5 rounded bg-amber-500/20 text-amber-300';
                }
            }

            // Update SVG TQF Triangle coordinates
            const cx = 160, cy = 130;
            const rA = 30 + vA * 0.9;
            const rB = 30 + vB * 0.9;
            const rC = 30 + vC * 0.9;

            const ax = cx, ay = cy - rA;
            const bx = cx + rB * Math.cos(Math.PI / 6), by = cy + rB * Math.sin(Math.PI / 6);
            const cxNode = cx - rC * Math.cos(Math.PI / 6), cyNode = cy + rC * Math.sin(Math.PI / 6);

            const poly = document.getElementById('cym-tqf-poly');
            if (poly) poly.setAttribute('points', `${ax},${ay} ${bx},${by} ${cxNode},${cyNode}`);

            const setCircle = (id, x, y) => {
                const c = document.getElementById(id);
                if (c) { c.setAttribute('cx', x); c.setAttribute('cy', y); }
            };
            setCircle('cym-node-a', ax, ay);
            setCircle('cym-node-b', bx, by);
            setCircle('cym-node-c', cxNode, cyNode);
        }

        function harmonizeCymaticAgents() {
            const sA = document.getElementById('cym-a-slider');
            const sB = document.getElementById('cym-b-slider');
            const sC = document.getElementById('cym-c-slider');
            if (sA && sB && sC) {
                sB.value = sA.value;
                sC.value = sA.value;
                updateCymaticSimulator();
            }
        }

        /***********************************************************************
         * 9. MODULE 06: TTP MODE A & FALCON PACKET CALCULATOR
         ***********************************************************************/
        let falconSecurityBits = 512;

        function updateTtpCalculator() {
            const inp = document.getElementById('ttp-float-input');
            if (!inp) return;
            const fOrig = parseFloat(inp.value) || 0;
            // Simulate 8-bit coarse quantization step (1/64th step)
            const fCoarse = Math.round(fOrig * 64) / 64;
            const fDelta = fOrig - fCoarse;
            const fRecon = fCoarse + fDelta;

            const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
            setTxt('ttp-coarse-val', fCoarse.toFixed(7));
            setTxt('ttp-delta-val', (fDelta >= 0 ? '+' : '') + fDelta.toFixed(7));
            setTxt('ttp-recon-val', `${fRecon.toFixed(7)} (illustrative sum)`);
        }

        function setFalconMode(bits) {
            falconSecurityBits = bits;
            const b512 = document.getElementById('falcon-btn-512');
            const b1024 = document.getElementById('falcon-btn-1024');
            if (b512 && b1024) {
                b512.className = bits === 512
                    ? 'px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-pointer'
                    : 'px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 cursor-pointer';
                b1024.className = bits === 1024
                    ? 'px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-pointer'
                    : 'px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 cursor-pointer';
            }
            updateFalconCalculator();
        }

        function updateFalconCalculator() {
            const bwSelect = document.getElementById('falcon-bw-select');
            const mbps = bwSelect ? parseFloat(bwSelect.value) : 1000;
            const bps = mbps * 1e6;

            const genBytes = falconSecurityBits === 512 ? 1579 : 3089;
            const chainBytes = falconSecurityBits === 512 ? 1348 : 2576;

            const genUs = ((genBytes * 8) / bps) * 1e6;
            const chainUs = ((chainBytes * 8) / bps) * 1e6;
            const pps = Math.floor(bps / (chainBytes * 8));

            const fmtTime = us => us >= 1000 ? (us / 1000).toFixed(2) + ' ms' : us.toFixed(2) + ' μs';

            const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
            setTxt('falcon-gen-size', `${genBytes.toLocaleString()} Bytes`);
            setTxt('falcon-gen-lat', `Serialization: ${fmtTime(genUs)}`);
            setTxt('falcon-chain-size', `${chainBytes.toLocaleString()} Bytes`);
            setTxt('falcon-chain-lat', `Serialization: ${fmtTime(chainUs)}`);
            setTxt('falcon-pps', `${pps.toLocaleString()} packets/sec`);
        }

        /***********************************************************************
         * 10. MODULE 07: INTERACTIVE F.A.Q. HUB
         ***********************************************************************/
        const FAQ_ITEMS = [
            {
                q: '1. Are you saying the raw ASCII binary of "cat" and "dog" has hidden geometry?',
                a: 'No—the exact opposite! Raw ASCII is an arbitrary 1960s lookup table for teletypes. In ASCII, "cat" and "dog" differ by 9 bits while "cat" and "car" differ by only 2 bits. That is why teaching a standard neural network in raw ASCII binary makes emergence brutally expensive: the network has to burn massive parameter capacity just to unlearn the alphabetical phonebook. SHD-CCP replaces arbitrary ASCII with a 64-bit geometric register where bit positions correspond directly to a 4×4×4 voxel cube and toroidal phase coordinates.'
            },
            {
                q: '2. Does that imply integers themselves possess an inherent geometry?',
                a: 'Yes, rigorously so—when a 64-bit integer is treated as an operator on a modular manifold rather than a scalar quantity on a 1D number line. Because 4 × 4 × 4 = 64, any 64-bit integer is bijectively a 3D cubic lattice over Z_4^3. Through Chinese Remainder Theorem (CRT) prime residue decompositions, Hamming hypercube symmetries, and quaternionic rotations, integers naturally form closed cyclical orbits on a torus.'
            },
            {
                q: '3. How do "cat" and "dog" actually relate inside the 64-bit SHD-CCP register?',
                a: 'In SHD-CCP Toroidal Ontology Mode (Form ID 12–15), "cat" (0xF942_6A01_8520_0012) and "dog" (0xF942_6A01_8520_0018) share the exact same upper 48 bits: Quaternionic Core (0xF942), Trefoil Pairing (0x6A01), and Meso-Toroidal Major Orbit (0x8520, Θ = 42°). They differ by only 2 bits in the lower 16-bit Poloidal Spin slab (ΔΦ = 6°). Hardware checks their semantic kinship in a single O(1) XOR clock cycle.'
            },
            {
                q: '4. How can a 64-bit register act as a "Pseudo-FPGA" without breaking compatibility?',
                a: 'Across the SHD-CCP specifications, the 64-bit payload dynamically reconfigures based on a 4-bit Form ID opcode: Form ID 3 performs lossless FP8+FP16 tensor reconstruction (TTP Mode A), Form ID 4–11 indexes Grand Codex polyhedra (TTP Mode B), Form ID 0–2 drives the Cymatic Subsumption Cascade, and Form ID 12–15 maps Toroidal Ontology. By enforcing strict 16-bit Z-slab boundaries ([63:48], [47:32], [31:16], [15:00]) and monotonic MSB→LSB entropy ordering, any receiver deterministically decodes the packet.'
            },
            {
                q: '5. How does the Cymatic Subsumption Cascade verify data without sequential CPU logic gates?',
                a: 'Instead of sequential Von Neumann if/and/or branching, SHD-CCP wraps the 64-bit seed into three 120°-offset phase waves (Agent A Master Clock at 0°, Agent B at +120°, Agent C at -120°). GPU Vertex Shaders evaluate the Meso Triple Quad Formula (TQF) sieve and bounce the streams orthogonally via qTri() inside the 4×4×4 Macro Manhattan L1 matrix. At the (3,7) Torus Knot center, 9 Forward (+ω) and 9 Inverse (-ω) streams phase-cancel to ΔT = 0 if valid.'
            }
        ];

        function renderFaqAccordion() {
            const container = document.getElementById('faq-accordion-container');
            if (!container) return;
            container.innerHTML = FAQ_ITEMS.map((item, idx) => `
                <div class="glass-sub rounded-2xl border border-slate-800 overflow-hidden">
                    <button type="button" onclick="toggleFaqItem(${idx})" aria-expanded="${idx === 0}" aria-controls="faq-body-${idx}" class="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-slate-900/50 transition cursor-pointer">
                        <span class="text-sm sm:text-base font-bold text-white">${item.q}</span>
                        <span id="faq-icon-${idx}" class="font-mono text-cyan-400 text-lg">${idx === 0 ? '−' : '+'}</span>
                    </button>
                    <div id="faq-body-${idx}" class="${idx === 0 ? '' : 'hidden'} px-4 pb-4 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/70 pt-3">
                        ${item.a}
                    </div>
                </div>
            `).join('');
        }

        function toggleFaqItem(idx) {
            const body = document.getElementById('faq-body-' + idx);
            const icon = document.getElementById('faq-icon-' + idx);
            if (!body || !icon) return;
            const isHidden = body.classList.contains('hidden');
            body.classList.toggle('hidden', !isHidden);
            icon.textContent = isHidden ? '−' : '+';
            icon.closest('button').setAttribute('aria-expanded', String(isHidden));
        }

        async function copyFaqSummary() {
            const summary = FAQ_ITEMS.map(item => item.q + '\n' + item.a).join('\n\n');
            await copyExplainerText(summary, document.getElementById('copy-faq-btn'));
        }

        async function copyExplainerText(value, button) {
            if (!button) return;
            const originalLabel = button.textContent;
            let copied = false;
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(value);
                    copied = true;
                }
            } catch (_) { /* Fall back to the browser's copy command. */ }
            if (!copied) {
                const previousFocus = document.activeElement;
                const textarea = document.createElement('textarea');
                textarea.value = value;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
                textarea.remove();
                if (previousFocus && previousFocus.focus) previousFocus.focus({ preventScroll: true });
            }
            button.textContent = copied ? 'Copied!' : 'Copy unavailable — select and copy the text';
            setTimeout(() => { button.textContent = originalLabel; }, 2500);
        }

        /***********************************************************************
         * 11. MODULE 08: MINIMIZED-BY-DEFAULT LLM SYSTEM PROMPT & GITHUB LOADER
         ***********************************************************************/
        const BUILTIN_PROMPTS = {
            '01_shd_ccp_core_bootloader.md': `# SHD-CCP LLM System Bootloader (v1.0)\nYou are operating with the Symbolic High-Dimensional Context-Compression Protocol (SHD-CCP).\n\n## Core Axiom\nNever treat a 64-bit integer token as flat ASCII bytes. Because 4 × 4 × 4 = 64, every 64-bit word is a 3D Cubic Voxel Lattice over Z_4^3 partitioned into four 16-bit planar Z-slabs:\n- Slab Z=3 [63:48]: Coarse Anchor / Quaternionic Core (Q) / FP16 Residual\n- Slab Z=2 [47:32]: Form ID [47:44] + Trefoil Pairing (K) / Grand Codex Shape ID\n- Slab Z=1 [31:16]: Meso-Toroidal Major Orbit (Theta) / Agent A Master Clock\n- Slab Z=0 [15:00]: Poloidal Minor Spin (Phi) / Zeta-Pole Scalar Return (Delta T)`,
            '02_pseudo_fpga_form_modes.md': `# SHD-CCP Pseudo-FPGA Multi-Mode Register Specification\nDecode Bits [47:44] (or the 32-bit LPF Header) as the invariant 4-bit Form ID before interpreting any 64-bit SHD-CCP payload:\n- Form ID 0..2 (Cymatic Cascade): Z3=Shape Power, Z2=TQF Torsion, Z1=Agent A Master Clock, Z0=Zeta Return dT.\n- Form ID 3 (TTP Mode A Lossless Float): Z3=FP16 f_delta, Z2=Control, Z1..Z0=4xFP8 Quaternion [w,x,y,z]. Reconstruct via Result = FP8_quat + FP16_payload.\n- Form ID 4..11 (TTP Mode B Grand Codex): Execute O(1) GetVector(Shape, Face, Region).\n- Form ID 12..15 (Toroidal Ontology Mode): Execute O(1) bitwise XOR + POPCNT across Z3..Z1 for macro similarity and Z0 for fine poloidal delta.`,
            '03_toroidal_markov_pump.md': `# Toroidal Manifold & Torsional Markov Pump Specification\nProject the 4×4×4 cubic register onto T^2 = S^1 × S^1 using the 720:1 double-cover spinor law:\n- X(Theta, Phi) = (R + r * cos(Phi)) * cos(Theta)\n- Y(Theta, Phi) = (R + r * cos(Phi)) * sin(Theta)\n- Z(Phi)        = r * sin(Phi)\nHomologous concepts ("cat" and "dog") occupy identical major toroidal orbits (Delta Theta = 0) and separated only by minor poloidal phase shifts (Delta Phi).`,
            '04_cymatic_cascade_tqf.md': `# 4-Phase Cymatic Cascade & Tri-Tier Governance\n1. Micro Tier: Spawn Agent A (0 deg Master Clock), Agent B (+120 deg), Agent C (-120 deg).\n2. Meso Tier: Compute Triple Quad Formula (TQF) bounding triangle skew to extract scalar gradient.\n3. Macro Tier: Offload 18 streams into the 4×4×4 Bounding Matrix (4400 units) using qTri() Manhattan L1 orthogonal bounces.\n4. Zero-Point: Collide 9 Forward (+w) and 9 Inverse (-w) streams at the (3,7) Torus Knot. Route surviving scalar error Delta T up the Zeta-Pole.`,
            '05_master_shd_ccp_protocol_bundle.md': `# Complete SHD-CCP Master Protocol Bundle (v1.0)\nEncapsulate all 64-bit cubic registers inside the 128-bit (16-Byte) Logical Packet Frame (LPF):\n[32-bit Header | 64-bit SHD-CCP Core Register | 32-bit CRC32 Footer]\nWrap Genesis packets (1,579B Falcon-512) and Chained packets (1,348B Falcon-512) for <15 microsecond post-quantum AI-to-AI telemetry.`
        };

        function togglePromptModule() {
            const body = document.getElementById('prompt-module-body');
            const chev = document.getElementById('prompt-chevron');
            const badge = document.getElementById('prompt-collapse-badge');
            if (!body || !chev) return;
            const isHidden = body.classList.contains('hidden');
            body.classList.toggle('hidden', !isHidden);
            chev.textContent = isHidden ? '[−]' : '[+]';
            chev.closest('button').setAttribute('aria-expanded', String(isHidden));
            if (badge) {
                badge.textContent = isHidden ? 'Expanded • Ready to Copy' : 'Minimized by Default • Click to Expand';
            }
        }

        let promptSelectionRequest = 0;
        let promptScanRequest = 0;

        function explainerPromptUrl(value, base = document.baseURI) {
            const url = new URL(value, base);
            if (url.protocol !== 'https:' && url.origin !== window.location.origin) {
                throw new Error('Use an HTTPS URL or a local same-origin path.');
            }
            if (url.username || url.password || !['http:', 'https:'].includes(url.protocol)) {
                throw new Error('Unsupported prompt URL.');
            }
            return url.href;
        }

        async function selectBuiltinPrompt() {
            const sel = document.getElementById('builtin-prompt-select');
            const viewer = document.getElementById('prompt-markdown-viewer');
            const fname = document.getElementById('active-prompt-filename');
            const status = document.getElementById('github-scan-status');
            if (!sel || !viewer) return;
            const request = ++promptSelectionRequest;
            const key = sel.value;
            const option = sel.selectedOptions[0];
            if (fname) fname.textContent = option && option.dataset.filename ? option.dataset.filename : 'prompts/' + key;
            if (Object.prototype.hasOwnProperty.call(BUILTIN_PROMPTS, key)) {
                viewer.value = BUILTIN_PROMPTS[key];
                viewer.removeAttribute('aria-busy');
                return;
            }
            viewer.value = '';
            viewer.setAttribute('aria-busy', 'true');
            try {
                const response = await fetch(explainerPromptUrl(key));
                if (!response.ok) throw new Error('HTTP ' + response.status);
                let content;
                if ((response.headers.get('content-type') || '').includes('json')) {
                    const metadata = await response.json();
                    if (metadata.encoding === 'base64' && typeof metadata.content === 'string') {
                        const bytes = Uint8Array.from(atob(metadata.content.replace(/\s/g, '')), character => character.charCodeAt(0));
                        content = new TextDecoder().decode(bytes);
                    } else if (metadata.download_url) {
                        const download = await fetch(explainerPromptUrl(metadata.download_url, response.url));
                        if (!download.ok) throw new Error('HTTP ' + download.status);
                        content = await download.text();
                    } else throw new Error('No markdown content returned.');
                } else content = await response.text();
                if (request !== promptSelectionRequest) return;
                viewer.value = content;
                if (status) status.textContent = 'Markdown loaded. Review it before copying.';
            } catch (error) {
                if (request !== promptSelectionRequest) return;
                viewer.value = '';
                if (status) status.textContent = 'Could not load this prompt: ' + error.message;
            } finally {
                if (request === promptSelectionRequest) viewer.removeAttribute('aria-busy');
            }
        }

        function restoreBuiltinPromptOptions() {
            const select = document.getElementById('builtin-prompt-select');
            select.replaceChildren(...Object.keys(BUILTIN_PROMPTS).map(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                return option;
            }));
            selectBuiltinPrompt();
        }

        async function scanGithubPromptsFolder() {
            const input = document.getElementById('github-folder-url');
            const status = document.getElementById('github-scan-status');
            const select = document.getElementById('builtin-prompt-select');
            if (!input || !status || !select) return;
            const request = ++promptScanRequest;
            const folderUrl = input.value.trim();
            if (!folderUrl) {
                restoreBuiltinPromptOptions();
                status.textContent = 'Enter a folder URL to scan. Using the five bundled prompts.';
                return;
            }
            status.textContent = 'Scanning for Markdown prompts…';
            try {
                const response = await fetch(explainerPromptUrl(folderUrl));
                if (!response.ok) throw new Error('HTTP ' + response.status);
                const data = await response.json();
                if (!Array.isArray(data)) throw new Error('Use a GitHub Contents API or JSON manifest URL.');
                const options = data.filter(item => item && typeof item.name === 'string' && item.name.endsWith('.md') && item.type !== 'dir').map(item => {
                    const source = item.download_url || item.url || item.name;
                    const option = document.createElement('option');
                    option.value = explainerPromptUrl(source, response.url);
                    option.dataset.filename = item.name;
                    option.textContent = item.name;
                    return option;
                });
                if (!options.length) throw new Error('No Markdown files returned.');
                if (request !== promptScanRequest) return;
                select.replaceChildren(...options);
                status.textContent = 'Found ' + options.length + ' Markdown files.';
                await selectBuiltinPrompt();
            } catch (error) {
                if (request !== promptScanRequest) return;
                restoreBuiltinPromptOptions();
                status.textContent = 'Scan unavailable (' + error.message + '). Using the five bundled prompts.';
            }
        }

        async function copyActivePrompt() {
            const viewer = document.getElementById('prompt-markdown-viewer');
            if (!viewer || !viewer.value || viewer.hasAttribute('aria-busy')) return;
            await copyExplainerText(viewer.value, document.getElementById('copy-prompt-btn'));
        }

        /***********************************************************************
         * 12. MASTER ANIMATION LOOP & WINDOW INITIALIZATION
         ***********************************************************************/
        function animateLoop() {
            explainerFrame = null;
            if (!isExplainerVisible() || document.hidden) return;
            explainerFrame = requestAnimationFrame(animateLoop);

            if (cubeGroup && cubeAutoRotate) {
                cubeGroup.rotation.y += 0.0045;
            }
            if (cubeRenderer && cubeScene && cubeCamera) {
                cubeRenderer.render(cubeScene, cubeCamera);
            }

            if (torusGroup && markovPumpRunning) {
                pumpPhase += 0.015;
                torusGroup.rotation.y += 0.0025;
                if (probeMesh) {
                    const tauEl = document.getElementById('torus-tau-slider');
                    const tau = tauEl ? parseInt(tauEl.value, 10) : 7;
                    const pos = torusCoords(pumpPhase, pumpPhase * (tau / 3), 0.08);
                    probeMesh.position.copy(pos);
                }
            }
            if (torusRenderer && torusScene && torusCamera) {
                torusRenderer.render(torusScene, torusCamera);
            }
        }

        window.addEventListener('resize', () => {
            const cCont = document.getElementById('cube-canvas-container');
            if (cCont && cubeRenderer && cubeCamera) {
                const w = cCont.clientWidth || 500;
                const h = cCont.clientHeight || 380;
                cubeCamera.aspect = w / h;
                cubeCamera.updateProjectionMatrix();
                cubeRenderer.setSize(w, h);
            }
            const tCont = document.getElementById('torus-canvas-container');
            if (tCont && torusRenderer && torusCamera) {
                const w = tCont.clientWidth || 600;
                const h = tCont.clientHeight || 390;
                torusCamera.aspect = w / h;
                torusCamera.updateProjectionMatrix();
                torusRenderer.setSize(w, h);
            }
        });

        let explainerInitialized = false;
        let explainerFrame = null;

        function isExplainerVisible() {
            const content = document.getElementById('main-content');
            const root = document.getElementById('interactive-explainer');
            return Boolean(root && content && !content.hidden && !content.classList.contains('hidden') && root.getClientRects().length);
        }

        function bindExplainerOrbit(canvas, group, description) {
            canvas.setAttribute('role', 'img');
            canvas.setAttribute('aria-label', description);
            // Horizontal drags rotate; vertical touch scrolling stays available.
            canvas.style.touchAction = 'pan-y';
            let pointer = null, lastX = 0, lastY = 0;
            canvas.addEventListener('pointerdown', event => {
                pointer = event.pointerId;
                lastX = event.clientX;
                lastY = event.clientY;
                canvas.setPointerCapture(event.pointerId);
            });
            canvas.addEventListener('pointermove', event => {
                if (pointer !== event.pointerId) return;
                group.rotation.y += (event.clientX - lastX) * 0.008;
                if (event.pointerType === 'mouse') group.rotation.x += (event.clientY - lastY) * 0.008;
                lastX = event.clientX;
                lastY = event.clientY;
            });
            const endDrag = () => { pointer = null; };
            canvas.addEventListener('pointerup', endDrag);
            canvas.addEventListener('pointercancel', endDrag);
            canvas.addEventListener('lostpointercapture', endDrag);
        }

        function initializeExplainer() {
            if (!isExplainerVisible()) return;
            if (!explainerInitialized) {
                renderPipelineStage();
                selectAsciiPair('cat_dog');
                refreshAllRegisterViews();
                runAluComparison();
                updateCymaticSimulator();
                updateTtpCalculator();
                updateFalconCalculator();
                renderFaqAccordion();
                selectBuiltinPrompt();
                explainerInitialized = true;
            }
            // These can be retried if Three.js was not available on initial load.
            if (!cubeRenderer) init3DCubeScene();
            if (!torusRenderer) init3DTorusScene();
            updateTorusSliders();
            const pumpButton = document.getElementById('torus-pump-btn');
            if (pumpButton) {
                pumpButton.textContent = markovPumpRunning ? '⏸ Torsional Markov Pump: RUNNING' : '▶ Torsional Markov Pump: PAUSED';
                pumpButton.setAttribute('aria-pressed', String(markovPumpRunning));
            }
            if (explainerFrame === null) animateLoop();
        }

        document.addEventListener('shd-content-ready', initializeExplainer);
        window.addEventListener('shd-content-ready', initializeExplainer);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) initializeExplainer();
        });
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeExplainer);
        else initializeExplainer();
