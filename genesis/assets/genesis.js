// Adapted from the user-provided Genesis Kernel visualization.
(() => {
        document.body.classList.toggle('is-embedded', window.parent !== window);
        const BLACKWELL_SCHEMA = [
            ...Array(4).fill({ code: 'ST', name: 'Structural Form ID', class: 'bit-st', hex: 0x8b5cf6 }),
            ...Array(1).fill({ code: 'PT', name: 'Parity', class: 'bit-pt', hex: 0x9ca3af }),
            ...Array(3).fill({ code: 'PL', name: 'Payload Scale', class: 'bit-pl', hex: 0x10b981 }),
            ...Array(8).fill({ code: 'PL', name: 'Payload Scale', class: 'bit-pl', hex: 0x10b981 }),
            ...Array(32).fill({ code: 'CO', name: 'Comp. Quaternion', class: 'bit-co', hex: 0xec4899 }),
            ...Array(5).fill({ code: 'PL', name: 'Payload Scale', class: 'bit-pl', hex: 0x10b981 }),
            ...Array(3).fill({ code: 'FR', name: 'Frequency ID', class: 'bit-fr', hex: 0x3b82f6 }),
            ...Array(2).fill({ code: 'FR', name: 'Frequency ID', class: 'bit-fr', hex: 0x3b82f6 }),
            ...Array(3).fill({ code: 'SP', name: 'Spin Class', class: 'bit-sp', hex: 0xef4444 }),
            ...Array(3).fill({ code: 'AM', name: 'Amplitude ID', class: 'bit-am', hex: 0xf59e0b })
        ];

        const STRUCTURAL_FORMS = [
            { id: 0, name: "Tetrahedron", tier: 1, desc: "Atomic Truth / Origin Point" },
            { id: 1, name: "Cube", tier: 1, desc: "Structured / Man-made Data" },
            { id: 2, name: "Octahedron", tier: 1, desc: "Network Hubs / Balanced Relations" },
            { id: 3, name: "Icosahedron", tier: 1, desc: "Complex Monolithic Concepts" },
            { id: 4, name: "Dodecahedron", tier: 1, desc: "High-Level Domains / Knowledge" },
            { id: 5, name: "Truncated Tetrahedron", tier: 2, desc: "Foundational Ideas with Caveats" },
            { id: 6, name: "Cuboctahedron", tier: 2, desc: "Dynamic Equilibrium / System Balance" },
            { id: 7, name: "Truncated Icosahedron", tier: 2, desc: "The Packet / Subject-Predicate Data" },
            { id: 8, name: "Rhombicuboctahedron", tier: 3, desc: "Parameters + Fundamental Laws" },
            { id: 9, name: "Icosidodecahedron", tier: 3, desc: "Narratives / Theories with Evidence" },
            { id: 10, name: "Truncated Cuboctahedron", tier: 3, desc: "Maximal Density Information" },
            { id: 11, name: "Snub Cube", tier: 4, desc: "Twisted Logic / Directed Causality" },
            { id: 12, name: "Snub Dodecahedron", tier: 4, desc: "Nuanced Argument / Ethical Stance" },
            { id: 13, name: "Cosmohedron", tier: 5, desc: "The 14th Form / Total System Data" },
            { id: 14, name: "Undefined Form", tier: 0, desc: "Void State / Overflow" },
            { id: 15, name: "Undefined Form", tier: 0, desc: "Void State / Overflow" }
        ];

        function getGeometryForForm(id, isWireframe) {
            const r = isWireframe ? 0.85 : 0.7;
            switch(id) {
                case 0: return new THREE.TetrahedronGeometry(r, 0);
                case 1: return new THREE.BoxGeometry(r*1.2, r*1.2, r*1.2);
                case 2: return new THREE.OctahedronGeometry(r, 0);
                case 3: return new THREE.IcosahedronGeometry(r, 0);
                case 4: return new THREE.DodecahedronGeometry(r, 0);
                case 5: return new THREE.TetrahedronGeometry(r, 1);
                case 6: return new THREE.BoxGeometry(r*1.2, r*1.2, r*1.2, 2, 2, 2);
                case 7: return new THREE.IcosahedronGeometry(r, 1);
                case 8: return new THREE.OctahedronGeometry(r, 1);
                case 9: return new THREE.DodecahedronGeometry(r, 1);
                case 10: return new THREE.OctahedronGeometry(r, 2);
                case 11: return new THREE.CylinderGeometry(r*0.8, r*0.8, r*1.2, 8);
                case 12: return new THREE.CylinderGeometry(r*0.8, r*0.8, r*1.2, 12);
                case 13: return new THREE.TorusKnotGeometry(r*0.5, r*0.15, 64, 8);
                default: return new THREE.SphereGeometry(r, 16, 16);
            }
        }

        // --- System Variables ---
        let scene, camera, renderer, controls;
        let voxels = [];
        let ttmptCoreGroup, tierD12, tierHex, tierHept, tierScalar, tierAtom, strassenGroup;
        let strassenNodes = [];
        let funnelLines = [];

        let collisionSparks = [];
        let sparkGeo;
        let sparkMat;

        let vD12Pos = [], vD12Neg = [];
        let vHexPos = [], vHexNeg = [];
        let vHept = [];
        const d12Radius = 16, hexRadius = 10, heptRadius = 5;

        let time = 0;
        let clock;

        let currentFrame = 0;
        const MAX_FRAMES = 720;
        let isPlaying = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let playbackSpeed = 0.5;

        let selectedVoxel = null;
        let isOrthogonalMode = false;
        let pulseFrame = -999;
        let pulseSpeed = 15.0;

        let topologyMode = 0;
        let toroidalLerp = 0.0;
        let currentGeo, currentEdgesGeo;

        let dynamicFreq = 1.0, dynamicAmp = 0.0, dynamicSpin = 0.0;
        let alignMode = 0;

        const themes = [
            { name: 'Dark Void', bgHex: 0x050505, gridColor: 0x003333, centroid: 0xffffff, cssBg: '#050505', cssPanel: 'rgba(5, 15, 20, 0.75)' },
            { name: 'Deep Lattice', bgHex: 0x000511, gridColor: 0x002255, centroid: 0x00ffff, cssBg: '#000511', cssPanel: 'rgba(5, 10, 25, 0.80)' },
            { name: 'Oracle Protocol', bgHex: 0x150d05, gridColor: 0x553300, centroid: 0xffaa00, cssBg: '#150d05', cssPanel: 'rgba(30, 20, 10, 0.85)' }
        ];
        let currentTheme = 0;
        let isAutoRotate = false;

        let frameRequest = null;
        let embeddingVisible = true;
        let canvasVisible = true;
        let initialized = false;

        function initializeGenesis() {
            const container = document.getElementById('canvas-container');
            try {
                if (typeof THREE === 'undefined' || typeof THREE.OrbitControls !== 'function') throw new Error('3D dependency unavailable');
                clock = new THREE.Clock();
                sparkGeo = new THREE.SphereGeometry(0.3, 8, 8);
                sparkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
                initThreeJS();
                buildCentroidCore();
                buildLattice();
                buildUI();
                setupInteractions();
                setupDraggablePanels();
                applyAlignmentMode();
                initializeSeedInput();
                document.getElementById('seed-form').dispatchEvent(new Event('submit', { cancelable: true }));
                updatePlayButton();
                initialized = true;
                new ResizeObserver(onWindowResize).observe(container);
                new IntersectionObserver(entries => {
                    canvasVisible = entries[0].isIntersecting;
                    resumeRendering();
                }, { rootMargin: '80px' }).observe(container);
                animate();
            } catch (error) {
                console.warn('Genesis preview unavailable:', error);
                if (renderer) renderer.dispose();
                container.replaceChildren();
                const message = document.createElement('p');
                message.className = 'canvas-message';
                message.textContent = 'The 3D preview is unavailable in this browser. You can continue as a guest from the sign-in page or read the manual.';
                container.appendChild(message);
                document.getElementById('seed-status').textContent = '3D rendering requires WebGL and the local visualization assets.';
                document.querySelectorAll('button, input').forEach(control => { control.disabled = true; });
                document.getElementById('fps-counter').textContent = '3D unavailable';
            }
        }

        function canRender() { return initialized && embeddingVisible && canvasVisible && !document.hidden; }
        function resumeRendering() {
            if (canRender() && frameRequest === null) { clock.getDelta(); animate(); }
        }
        document.addEventListener('visibilitychange', resumeRendering);
        window.addEventListener('message', event => {
            if (event.source !== window.parent || event.origin !== window.location.origin) return;
            if (event.data && event.data.type === 'shd-genesis-visibility' && typeof event.data.visible === 'boolean') {
                embeddingVisible = event.data.visible;
                resumeRendering();
            }
        });
        window.addEventListener('pagehide', () => { embeddingVisible = false; });
        window.addEventListener('pageshow', () => { embeddingVisible = true; resumeRendering(); });
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeGenesis);
        else queueMicrotask(initializeGenesis);

        function logLedger(message) {
            const box = document.getElementById('ledger-box');
            if(!box) return;
            const entry = document.createElement('div');
            entry.innerHTML = `<span class="text-[#ff00ff]">></span> ${message}`;
            box.appendChild(entry);
            if(box.children.length > 50) {
                // Keep the first item if it's the "awaiting" message, else just shift
                if (box.children[0].innerText.includes("Awaiting")) {
                    box.removeChild(box.children[0]);
                } else {
                    box.removeChild(box.firstChild);
                }
            }
            box.scrollTop = box.scrollHeight;
        }

        function initThreeJS() {
            const container = document.getElementById('canvas-container');
            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x050505, 0.015);
            camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
            camera.position.set(15, 12, 18);
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            container.appendChild(renderer.domElement);
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            renderer.domElement.setAttribute('aria-hidden', 'true');
            renderer.domElement.style.touchAction = 'pan-y';
            controls.touches.ONE = THREE.TOUCH.ROTATE;
            controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
            controls.dampingFactor = 0.05;
            controls.autoRotate = false;

            scene.add(new THREE.AmbientLight(0x444444));
            const pLight1 = new THREE.PointLight(0xffffff, 1, 100);
            pLight1.position.set(20, 20, 20);
            scene.add(pLight1);
            const pLight2 = new THREE.PointLight(0xffffff, 0.8, 100);
            pLight2.position.set(-20, -20, -20);
            scene.add(pLight2);
            window.addEventListener('resize', onWindowResize, false);
        }

        // --- NEW: Ported Markov Pump Funnel Core ---
        function createRing(verts, color, dash=false) {
            const pts = [...verts, verts[0]];
            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            const mat = dash ? new THREE.LineDashedMaterial({color, dashSize:0.5, gapSize:0.5, transparent:true, opacity:0.6}) :
                               new THREE.LineBasicMaterial({color, transparent:true, opacity:0.6});
            const line = new THREE.Line(geo, mat);
            if(dash) line.computeLineDistances();
            return line;
        }

        function createStar(verts, step, color, dash=false, offset=0) {
            const pts = [];
            for(let i=0; i<=verts.length; i++) pts.push(verts[((i*step)+offset)%verts.length]);
            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            const mat = dash ? new THREE.LineDashedMaterial({color, dashSize:0.5, gapSize:0.5, transparent:true, opacity:0.8}) :
                               new THREE.LineBasicMaterial({color, transparent:true, opacity:0.8});
            const line = new THREE.Line(geo, mat);
            if(dash) line.computeLineDistances();
            return line;
        }

        function addFunnelLine(sourceIdx, targetIdx, sVerts, tVerts, sTier, tTier, mat) {
            const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), mat.clone());
            line.userData = { sourceIdx, targetIdx, sVerts, tVerts, sTier, tTier, baseColor: mat.color.getHex() };
            ttmptCoreGroup.add(line);
            funnelLines.push(line);
        }

        function buildCentroidCore() {
            ttmptCoreGroup = new THREE.Group();
            tierD12 = new THREE.Group(); tierHex = new THREE.Group(); tierHept = new THREE.Group();
            tierScalar = new THREE.Group(); tierAtom = new THREE.Group();
            ttmptCoreGroup.add(tierD12, tierHex, tierHept, tierScalar, tierAtom);

            for(let i=0; i<12; i++) {
                const a = (i/12)*Math.PI*2;
                vD12Pos.push(new THREE.Vector3(Math.cos(a)*d12Radius, 0, Math.sin(a)*d12Radius));
                vD12Neg.push(new THREE.Vector3(Math.cos(a + Math.PI/12)*d12Radius, 0, Math.sin(a + Math.PI/12)*d12Radius));
            }
            for(let i=0; i<6; i++) {
                const a = (i/6)*Math.PI*2;
                vHexPos.push(new THREE.Vector3(Math.cos(a)*hexRadius, 0, Math.sin(a)*hexRadius));
                vHexNeg.push(new THREE.Vector3(Math.cos(a + Math.PI/6)*hexRadius, 0, Math.sin(a + Math.PI/6)*hexRadius));
            }
            for(let i=0; i<7; i++) {
                const a = (i/7)*Math.PI*2;
                vHept.push(new THREE.Vector3(Math.cos(a)*heptRadius, 0, Math.sin(a)*heptRadius));
            }

            tierD12.add(createRing(vD12Pos, 0xf97316));
            tierD12.add(createRing(vD12Neg, 0xa855f7, true));
            tierHex.add(createStar(vHexPos, 2, 0xfde047, false, 0));
            tierHex.add(createStar(vHexNeg, 2, 0x67e8f9, true, 1));
            tierHept.add(createStar(vHept, 2, 0x2dd4bf, false, 0));
            tierHept.add(createStar(vHept, 3, 0x2dd4bf, true, 0));

            const funnelMatPos = new THREE.LineBasicMaterial({color: 0xf97316, transparent: true, opacity: 0.3});
            const funnelMatNeg = new THREE.LineBasicMaterial({color: 0xa855f7, transparent: true, opacity: 0.3});
            const funnelMatHept = new THREE.LineBasicMaterial({color: 0x2dd4bf, transparent: true, opacity: 0.4});
            for(let i=0; i<12; i++) {
                addFunnelLine(i, i%6, vD12Pos, vHexPos, tierD12, tierHex, funnelMatPos);
                addFunnelLine(i, i%6, vD12Neg, vHexNeg, tierD12, tierHex, funnelMatNeg);
            }
            for(let i=0; i<6; i++) {
                addFunnelLine(i, i, vHexPos, vHept, tierHex, tierHept, funnelMatHept);
                addFunnelLine(i, (i+3)%7, vHexNeg, vHept, tierHex, tierHept, funnelMatHept);
            }
            for(let i=0; i<7; i++) {
                addFunnelLine(i, 0, vHept, [new THREE.Vector3(0,0,0)], tierHept, tierScalar, funnelMatHept);
            }

            // Strassen Nodes
            strassenGroup = new THREE.Group();
            for(let i=0; i<12; i++) {
                const station = new THREE.Group();
                const angle = (i / 12) * Math.PI * 2;
                station.position.set(Math.cos(angle) * d12Radius, 0, Math.sin(angle) * d12Radius);
                station.rotation.y = -angle;

                const rMatY = new THREE.MeshPhongMaterial({color: 0xfde047, transparent: true, opacity: 0.6, emissive: 0xfde047, emissiveIntensity: 0.2});
                const rMatC = new THREE.MeshPhongMaterial({color: 0x67e8f9, transparent: true, opacity: 0.6, emissive: 0x67e8f9, emissiveIntensity: 0.2});
                const rMatR = new THREE.MeshPhongMaterial({color: 0xf43f5e, transparent: true, opacity: 0.6, emissive: 0xf43f5e, emissiveIntensity: 0.2});

                const r1 = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.08, 8, 32), rMatY); r1.rotation.x = Math.PI/2;
                const r2 = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.08, 8, 32), rMatC); r2.rotation.y = Math.PI/2;
                const r3 = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.08, 8, 32), rMatR); r3.rotation.z = Math.PI/2;

                const emMat = new THREE.MeshPhongMaterial({color: 0xffffff, transparent: true, opacity: 0.9, emissive: 0x2dd4bf, emissiveIntensity: 0.8});
                const emNode = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), emMat);

                station.add(r1, r2, r3, emNode);
                station.userData = { r1, r2, r3, emNode, idx: i };
                strassenGroup.add(station);
                strassenNodes.push(emNode);
            }
            tierAtom.add(strassenGroup);

            ttmptCoreGroup.scale.setScalar(0.08); // Start hyper-compressed
            scene.add(ttmptCoreGroup);
        }

        function buildLattice() {
            const size = 4;
            const spacing = 2.5;
            const offset = (size - 1) * spacing / 2;

            currentGeo = getGeometryForForm(0, false);
            const wireBase = getGeometryForForm(0, true);
            currentEdgesGeo = new THREE.EdgesGeometry(wireBase);
            wireBase.dispose();

            const cellGeo = new THREE.BoxGeometry(spacing, spacing, spacing);
            const cellEdges = new THREE.EdgesGeometry(cellGeo);
            const ringGeo = new THREE.TorusGeometry(0.2, 0.015, 8, 32);

            let idCounter = 0;

            for(let x=0; x<size; x++) {
                for(let y=0; y<size; y++) {
                    for(let z=0; z<size; z++) {
                        const px = x * spacing - offset;
                        const py = y * spacing - offset;
                        const pz = z * spacing - offset;
                        const posCubic = new THREE.Vector3(px, py, pz);

                        const u_ang = (idCounter / 64) * Math.PI * 2 * 6;
                        const v_ang = (idCounter / 64) * Math.PI * 2;
                        const R_tor = 18.0;
                        const r_tor = 6.0;
                        const tx = (R_tor + r_tor * Math.cos(u_ang)) * Math.cos(v_ang);
                        const tz = (R_tor + r_tor * Math.cos(u_ang)) * Math.sin(v_ang);
                        const ty = r_tor * Math.sin(u_ang);
                        const posToroidal = new THREE.Vector3(tx, ty, tz);

                        const schema = BLACKWELL_SCHEMA[idCounter];

                        const voxelGroup = new THREE.Group();
                        voxelGroup.position.copy(posCubic);

                        const cellMat = new THREE.LineBasicMaterial({ color: themes[0].gridColor, transparent: true, opacity: 0.15 });
                        const cellWire = new THREE.LineSegments(cellEdges, cellMat);
                        voxelGroup.add(cellWire);

                        const material = new THREE.MeshPhysicalMaterial({
                            color: schema.hex,
                            metalness: 0.4,
                            roughness: 0.2,
                            transparent: true,
                            opacity: 0.8,
                            wireframe: false
                        });

                        const solidMesh = new THREE.Mesh(currentGeo, material);
                        const jtWireMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
                        const jtWireMesh = new THREE.LineSegments(currentEdgesGeo, jtWireMat);

                        const localCentroidGeo = new THREE.IcosahedronGeometry(0.15, 0);
                        const localCentroidMat = new THREE.MeshBasicMaterial({ color: themes[0].centroid, wireframe: true, transparent: true, opacity: 1.0 });
                        const localCentroid = new THREE.Mesh(localCentroidGeo, localCentroidMat);

                        const gyroGroup = new THREE.Group();
                        const matOuter = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 1.0 });
                        const ringOuter = new THREE.Mesh(ringGeo, matOuter);
                        ringOuter.position.set(0.25, 0.25, -0.25); ringOuter.lookAt(0, 0, 0);
                        const matMiddle = new THREE.MeshBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 1.0 });
                        const ringMiddle = new THREE.Mesh(ringGeo, matMiddle);
                        ringMiddle.position.set(0.25, -0.25, 0.25); ringMiddle.lookAt(0, 0, 0);
                        const matInner = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 1.0 });
                        const ringInner = new THREE.Mesh(ringGeo, matInner);
                        ringInner.position.set(-0.25, 0.25, 0.25);  ringInner.lookAt(0, 0, 0);
                        gyroGroup.add(ringOuter, ringMiddle, ringInner);

                        voxelGroup.add(solidMesh, jtWireMesh, localCentroid, gyroGroup);
                        scene.add(voxelGroup);

                        const stringGeo = new THREE.BufferGeometry();
                        const stringPts = new Float32Array(50 * 3);
                        stringGeo.setAttribute('position', new THREE.BufferAttribute(stringPts, 3));
                        const stringMat = new THREE.LineBasicMaterial({
                            color: 0xff00ff,
                            transparent: true,
                            opacity: 0.0,
                            blending: THREE.AdditiveBlending
                        });
                        const stringMesh = new THREE.Line(stringGeo, stringMat);
                        scene.add(stringMesh);

                        const quat = new THREE.Quaternion();
                        const distToCenter = Math.sqrt(px*px + py*py + pz*pz);

                        voxels.push({
                            id: idCounter,
                            schema: schema,
                            bitValue: 0,
                            grid: {x, y, z},
                            posCubic: posCubic,
                            posToroidal: posToroidal,
                            group: voxelGroup,
                            solid: solidMesh,
                            wireframe: jtWireMesh,
                            cellWire: cellWire,
                            localCentroid: localCentroid,
                            gyroGroup: gyroGroup,
                            ringOuter: ringOuter, ringMiddle: ringMiddle, ringInner: ringInner,
                            matOuter: matOuter, matMiddle: matMiddle, matInner: matInner,
                            scalarString: { mesh: stringMesh, pts: stringPts },
                            baseQuat: quat.clone(),
                            currentQuat: quat.clone(),
                            distToCenter: distToCenter,
                            phaseOffset: distToCenter * 1.5,
                            waveEnergy: 0,
                            energy: 0,
                            material: material,
                            jtWireMat: jtWireMat,
                            cellMat: cellMat,
                            centroidMat: localCentroidMat
                        });

                        idCounter++;
                    }
                }
            }
        }

        function applyAlignmentMode() {
            voxels.forEach(v => {
                if (alignMode === 0) {
                    const dummy = new THREE.Object3D();
                    dummy.position.copy(v.group.position);
                    dummy.lookAt(0, 0, 0);
                    v.baseQuat.copy(dummy.quaternion);
                } else if (alignMode === 1) {
                    v.baseQuat.set(0, 0, 0, 1);
                } else {
                    v.baseQuat.setFromAxisAngle(
                        new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
                        Math.random() * Math.PI * 2
                    );
                }
            });
        }

        function parsePacketLogic() {
            const stVal = (voxels[0].bitValue << 3) | (voxels[1].bitValue << 2) | (voxels[2].bitValue << 1) | voxels[3].bitValue;

            const formInfo = STRUCTURAL_FORMS[stVal];
            document.getElementById('val-form').innerText = `${stVal}: ${formInfo.name}`;
            document.getElementById('val-form-tier').innerText = `Tier ${formInfo.tier}: ${formInfo.desc}`;

            const newGeo = getGeometryForForm(stVal, false);
            const newWireBase = getGeometryForForm(stVal, true);
            const newEdgesGeo = new THREE.EdgesGeometry(newWireBase);
            newWireBase.dispose();

            if (currentGeo) currentGeo.dispose();
            if (currentEdgesGeo) currentEdgesGeo.dispose();
            currentGeo = newGeo;
            currentEdgesGeo = newEdgesGeo;

            voxels.forEach(v => {
                v.solid.geometry = currentGeo;
                v.wireframe.geometry = currentEdgesGeo;
            });

            const frVal = (voxels[53].bitValue << 4) | (voxels[54].bitValue << 3) |
                          (voxels[55].bitValue << 2) | (voxels[56].bitValue << 1) | voxels[57].bitValue;
            const spVal = (voxels[58].bitValue << 2) | (voxels[59].bitValue << 1) | voxels[60].bitValue;
            const amVal = (voxels[61].bitValue << 2) | (voxels[62].bitValue << 1) | voxels[63].bitValue;

            dynamicFreq = 1.0 + (frVal / 31.0) * 15.0;
            dynamicAmp = (amVal / 7.0);
            dynamicSpin = (spVal / 7.0);

            document.getElementById('freq-slider').value = (frVal / 31.0) * 100;
            document.getElementById('strain-slider').value = (amVal / 7.0) * 100;
            document.getElementById('val-freq').innerText = dynamicFreq.toFixed(1) + ' Hz';
            document.getElementById('val-strain').innerText = ((amVal / 7.0) * 100).toFixed(0) + '%';
        }

        function toggleBit(id) {
            const v = voxels[id];
            v.bitValue = v.bitValue === 0 ? 1 : 0;

            const bitDiv = document.getElementById(`bit-${id}`);
            bitDiv.querySelector('.bit-value').textContent = v.bitValue;
            bitDiv.setAttribute('aria-pressed', String(v.bitValue === 1));
            syncSeedFromBits();

            if(v.bitValue === 1) {
                bitDiv.classList.add('bit-on');
                v.material.opacity = 1.0;
                v.material.emissive.setHex(v.schema.hex);
                v.material.emissiveIntensity = 0.4;
            } else {
                bitDiv.classList.remove('bit-on');
                v.material.opacity = 0.8;
                v.material.emissive.setHex(0x000000);
            }

            parsePacketLogic();
            selectVoxel(id);
        }

        function buildUI() {
            const matrixContainer = document.getElementById('bit-matrix');

            for(let i=0; i<64; i++) {
                const schema = BLACKWELL_SCHEMA[i];
                const bit = document.createElement('button');
                bit.type = 'button';
                bit.setAttribute('aria-pressed', 'false');
                bit.setAttribute('aria-label', `Bit ${i}: ${schema.name}`);
                bit.className = `bit-box ${schema.class}`;
                bit.id = `bit-${i}`;
                bit.title = `Bit ${i}: ${schema.name}`;
                const value = document.createElement('span');
                value.className = 'bit-value';
                value.textContent = '0';
                bit.appendChild(value);

                const label = document.createElement('span');
                label.className = 'schema-label';
                label.innerText = schema.code;
                bit.appendChild(label);

                bit.onclick = () => toggleBit(i);
                matrixContainer.appendChild(bit);
            }

            document.getElementById('btn-topology').onclick = (e) => {
                topologyMode = 1 - topologyMode;
                if(topologyMode === 1) {
                    e.target.innerText = "Topology: TOROIDAL (EXPLODED)";
                    e.target.classList.replace('bg-[#110022]', 'bg-[#ff00ff]');
                    e.target.classList.replace('text-[#ff00ff]', 'text-[#000000]');
                    document.getElementById('phase-status').innerText = "PHASE: EXPLODED TOROIDAL";
                    document.getElementById('phase-status').classList.add('text-[#ff00ff]');
                    document.getElementById('phase-status').classList.remove('text-[#00ffcc]');
                    new TWEEN.Tween(camera.position).to({x: 25, y: 30, z: 35}, 1000).easing(TWEEN.Easing.Quadratic.Out).start();
                } else {
                    e.target.innerText = "Topology: CUBIC LATTICE";
                    e.target.classList.replace('bg-[#ff00ff]', 'bg-[#110022]');
                    e.target.classList.replace('text-[#000000]', 'text-[#ff00ff]');
                    document.getElementById('phase-status').innerText = "PHASE: COHERENT CUBIC";
                    document.getElementById('phase-status').classList.add('text-[#00ffcc]');
                    document.getElementById('phase-status').classList.remove('text-[#ff00ff]');
                }
            };

            document.getElementById('btn-alignment').onclick = (e) => {
                alignMode = (alignMode + 1) % 3;
                const labels = ["CENTROID FOCUS", "UNIFIED (MASTER)", "CHAOTIC (RANDOM)"];
                e.target.innerText = `Alignment: ${labels[alignMode]}`;
                pulseFrame = -999;
                applyAlignmentMode();
            };

            document.getElementById('btn-pulse').onclick = () => {
                pulseFrame = currentFrame;
                document.getElementById('phase-status').innerText = "PHASE: PROPAGATING";
                document.getElementById('phase-status').classList.remove('text-magenta');
                document.getElementById('phase-status').classList.add('text-[#00ffcc]');
            };

            document.getElementById('btn-orthogonal').onclick = () => {
                isOrthogonalMode = !isOrthogonalMode;
                const status = isOrthogonalMode ? "ORTHOGONAL LOCKED" : "COHERENT";
                document.getElementById('phase-status').innerText = `PHASE: ${status}`;
                document.getElementById('phase-status').className = `text-xs mt-1 transition-colors duration-500 ${isOrthogonalMode ? 'text-[#ff00ff]' : 'text-magenta'}`;
            };

            document.getElementById('btn-reset').onclick = () => {
                pulseFrame = -999;
                for(let i=0; i<64; i++) {
                    if(voxels[i].bitValue === 1) toggleBit(i);
                }
                applyAlignmentMode();
            };

            document.getElementById('btn-vis-toggle').onclick = () => {
                const panel = document.getElementById('vis-panel');
                panel.classList.toggle('hidden');
                document.getElementById('btn-vis-toggle').setAttribute('aria-expanded', String(!panel.classList.contains('hidden')));
            };

            document.getElementById('vis-lattice').oninput = (e) => {
                const val = e.target.value;
                document.getElementById('val-vis-lattice').innerText = `${val}%`;
                voxels.forEach(v => { v.cellMat.opacity = val / 100; v.cellWire.visible = val > 0; });
            };

            document.getElementById('vis-wireframe').oninput = (e) => {
                const val = e.target.value;
                document.getElementById('val-vis-wireframe').innerText = `${val}%`;
                voxels.forEach(v => { v.jtWireMat.opacity = val / 100; v.wireframe.visible = val > 0; });
            };

            document.getElementById('vis-centroid').oninput = (e) => {
                const val = e.target.value;
                document.getElementById('val-vis-centroid').innerText = `${val}%`;
                if(ttmptCoreGroup) ttmptCoreGroup.visible = val > 0;
            };

            document.getElementById('vis-voxels').oninput = (e) => {
                const val = e.target.value;
                document.getElementById('val-vis-voxels').innerText = `${val}%`;
                voxels.forEach(v => { v.solid.visible = val > 0; });
            };

            document.getElementById('vis-gyros').oninput = (e) => {
                const val = e.target.value;
                document.getElementById('val-vis-gyros').innerText = `${val}%`;
                voxels.forEach(v => {
                    v.matOuter.opacity = val / 100;
                    v.matMiddle.opacity = val / 100;
                    v.matInner.opacity = val / 100;
                    const isVisible = val > 0;
                    v.ringOuter.visible = isVisible;
                    v.ringMiddle.visible = isVisible;
                    v.ringInner.visible = isVisible;
                });
            };

            document.getElementById('btn-theme').onclick = () => {
                currentTheme = (currentTheme + 1) % themes.length;
                applyTheme(themes[currentTheme]);
            };

            document.getElementById('btn-autorotate').onclick = (e) => {
                isAutoRotate = !isAutoRotate;
                controls.autoRotate = isAutoRotate;
                e.target.innerText = `Auto-Rotate: ${isAutoRotate ? 'ON' : 'OFF'}`;
                e.target.setAttribute('aria-pressed', String(isAutoRotate));
                if (isAutoRotate) e.target.classList.add('bg-[#003333]', 'text-[#00ffcc]');
                else e.target.classList.remove('bg-[#003333]', 'text-[#00ffcc]');
            };

            const btnPlay = document.getElementById('btn-play');
            const slider = document.getElementById('frame-slider');

            document.getElementById('btn-step-fwd').onclick = () => {
                isPlaying = false;
                updatePlayButton();
                btnPlay.classList.replace('bg-[#00ffcc]', 'bg-transparent');
                btnPlay.classList.replace('text-[#001111]', 'text-[#00ffcc]');
                currentFrame = Math.floor(currentFrame) + 1;
                if (currentFrame >= MAX_FRAMES) currentFrame = 0;
                slider.value = currentFrame;
            };

            document.getElementById('speed-slider').oninput = (e) => {
                const val = e.target.value;
                playbackSpeed = val / 100.0;
                document.getElementById('speed-val').innerText = `${val}%`;
            };

            btnPlay.onclick = () => {
                isPlaying = !isPlaying;
                if (isPlaying) {
                    updatePlayButton();
                    btnPlay.classList.replace('bg-transparent', 'bg-[#00ffcc]');
                    btnPlay.classList.replace('text-[#001111]', 'text-[#00ffcc]');
                } else {
                    updatePlayButton();
                    btnPlay.classList.replace('bg-[#00ffcc]', 'bg-transparent');
                    btnPlay.classList.replace('text-[#001111]', 'text-[#00ffcc]');
                }
            };

            slider.oninput = (e) => {
                currentFrame = parseInt(e.target.value);
                isPlaying = false;
                updatePlayButton();
                btnPlay.classList.replace('bg-[#00ffcc]', 'bg-transparent');
                btnPlay.classList.replace('text-[#001111]', 'text-[#00ffcc]');
            };
        }

        const TWEEN = {
            Tween: class {
                constructor(obj) { this.obj = obj; this.dest = null; this.dur = 0; this.ease = null; this.startT = 0; this.src = null; }
                to(dest, dur) { this.dest = dest; this.dur = dur; return this; }
                easing(ease) { this.ease = ease; return this; }
                start() {
                    this.startT = performance.now();
                    this.src = {x: this.obj.x, y: this.obj.y, z: this.obj.z};
                    TWEEN.tweens.push(this);
                }
                update(t) {
                    let prog = Math.min((t - this.startT) / this.dur, 1.0);
                    if(this.ease) prog = this.ease(prog);
                    this.obj.x = this.src.x + (this.dest.x - this.src.x) * prog;
                    this.obj.y = this.src.y + (this.dest.y - this.src.y) * prog;
                    this.obj.z = this.src.z + (this.dest.z - this.src.z) * prog;
                    return prog < 1.0;
                }
            },
            tweens: [],
            update: function(t) { this.tweens = this.tweens.filter(tw => tw.update(t)); },
            Easing: { Quadratic: { Out: k => k * (2 - k) } }
        };

        function setupDraggablePanels() {
            function makeDraggable(elmntId, headerId) {
                const elmnt = document.getElementById(elmntId);
                const header = document.getElementById(headerId);
                let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

                header.onmousedown = dragMouseDown;

                function dragMouseDown(e) {
                    e = e || window.event;
                    if(e.target.tagName.toLowerCase() === 'button') return;
                    e.preventDefault();
                    pos3 = e.clientX;
                    pos4 = e.clientY;
                    document.onmouseup = closeDragElement;
                    document.onmousemove = elementDrag;

                    elmnt.style.zIndex = 30;
                    if(elmntId === 'panel-projector') document.getElementById('panel-inspector').style.zIndex = 20;
                    else document.getElementById('panel-projector').style.zIndex = 20;
                }

                function elementDrag(e) {
                    e = e || window.event;
                    e.preventDefault();
                    pos1 = pos3 - e.clientX;
                    pos2 = pos4 - e.clientY;
                    pos3 = e.clientX;
                    pos4 = e.clientY;
                    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
                    elmnt.style.right = 'auto';
                }

                function closeDragElement() {
                    document.onmouseup = null;
                    document.onmousemove = null;
                }
            }

            function makeCollapsible(btnId, contentId) {
                const btn = document.getElementById(btnId);
                const content = document.getElementById(contentId);
                btn.onclick = (e) => {
                    e.stopPropagation();
                    if(content.style.display === 'none') {
                        content.style.display = 'flex';
                        btn.innerText = '-';
                        btn.setAttribute('aria-expanded', 'true');
                    } else {
                        content.style.display = 'none';
                        btn.innerText = '+';
                        btn.setAttribute('aria-expanded', 'false');
                    }
                };
            }


            makeCollapsible('btn-col-projector', 'content-projector');

            makeCollapsible('btn-col-inspector', 'content-inspector');
        }

        function applyTheme(theme) {
            document.documentElement.style.setProperty('--color-bg', theme.cssBg);
            document.documentElement.style.setProperty('--color-panel', theme.cssPanel);

            scene.fog.color.setHex(theme.bgHex);

            voxels.forEach(v => {
                v.cellMat.color.setHex(theme.gridColor);
                v.centroidMat.color.setHex(theme.centroid);
            });
        }

        function setupInteractions() {
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();

            let pointerStart = null;
            renderer.domElement.addEventListener('pointerdown', event => { pointerStart = { x: event.clientX, y: event.clientY }; });
            renderer.domElement.addEventListener('click', (event) => {
                if (pointerStart && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 6) return;
                if(event.target.closest('.interactive')) return;
                const bounds = renderer.domElement.getBoundingClientRect();
                mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
                mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

                raycaster.setFromCamera(mouse, camera);
                const meshes = voxels.map(v => v.solid);
                const intersects = raycaster.intersectObjects(meshes);

                if (intersects.length > 0) {
                    const hitMesh = intersects[0].object;
                    const voxel = voxels.find(v => v.solid === hitMesh);
                    if(voxel) {
                        toggleBit(voxel.id);
                    }
                } else {
                    selectVoxel(null);
                }
            });
        }

        function selectVoxel(id) {
            if(selectedVoxel) {
                document.getElementById(`bit-${selectedVoxel.id}`).classList.remove('selected');
            }

            if(id !== null) {
                selectedVoxel = voxels[id];
                document.getElementById(`bit-${id}`).classList.add('selected');
            } else {
                selectedVoxel = null;
            }
            updateInspector();
        }

        function updateInspector() {
            if(!selectedVoxel) {
                document.getElementById('inspect-id').innerText = '--';
                document.getElementById('inspect-pos').innerText = '--';
                document.getElementById('inspect-state').innerText = '--';
                document.getElementById('inspect-state').style.color = '#fff';
                document.getElementById('inspect-field').innerText = '--';
                document.getElementById('inspect-field').style.color = '#00ffcc';
                document.getElementById('inspect-quat').innerText = '[ --, --, --, -- ]';
                return;
            }

            document.getElementById('inspect-id').innerText = `${selectedVoxel.id} (0x${selectedVoxel.id.toString(16).padStart(2, '0').toUpperCase()})`;
            document.getElementById('inspect-pos').innerText = `[${selectedVoxel.grid.x}, ${selectedVoxel.grid.y}, ${selectedVoxel.grid.z}]`;

            document.getElementById('inspect-state').innerText = selectedVoxel.bitValue === 1 ? 'TRUE (1)' : 'FALSE (0)';
            document.getElementById('inspect-state').style.color = selectedVoxel.bitValue === 1 ? '#00ffcc' : '#ef4444';

            document.getElementById('inspect-field').innerText = selectedVoxel.schema.name;
            document.getElementById('inspect-field').style.color = '#' + selectedVoxel.schema.hex.toString(16).padStart(6, '0');

            const q = selectedVoxel.currentQuat;
            document.getElementById('inspect-quat').innerText =
                `[ ${q.w.toFixed(3)}, ${q.x.toFixed(3)}, ${q.y.toFixed(3)}, ${q.z.toFixed(3)} ]`;
        }

        function onWindowResize() {
            if (!renderer || !camera) return;
            const container = document.getElementById('canvas-container');
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }

        let lastPulseT = 0;

        function animate() {
            frameRequest = null;
            if (!canRender()) return;
            frameRequest = requestAnimationFrame(animate);
            TWEEN.update(performance.now());
            const renderDelta = clock.getDelta();

            if (isPlaying) {
                currentFrame += playbackSpeed;
                if (currentFrame >= MAX_FRAMES) currentFrame -= MAX_FRAMES;
                document.getElementById('frame-slider').value = Math.floor(currentFrame);
            } else {
                currentFrame = parseFloat(document.getElementById('frame-slider').value);
            }

            document.getElementById('frame-counter').innerText = `${Math.floor(currentFrame)} / ${MAX_FRAMES}`;

            time = (currentFrame / MAX_FRAMES) * Math.PI * 12;

            controls.update();

            const targetLerp = topologyMode === 1 ? 1.0 : 0.0;
            toroidalLerp += (targetLerp - toroidalLerp) * 0.04;

            const cycleRatio = currentFrame / MAX_FRAMES;

            // --- NEW: MARKOV PUMP FUNNEL (CORE) ANIMATION ---
            const coreScale = 0.08 + toroidalLerp * 0.92;
            const decompressionBreath = 1.0 + Math.sin(cycleRatio * Math.PI * 2 * 12) * 0.05 * toroidalLerp;
            ttmptCoreGroup.scale.setScalar(coreScale * decompressionBreath);

            const coreBaseTheta = time * 0.5;
            tierScalar.rotation.y = coreBaseTheta;
            tierHept.rotation.y = coreBaseTheta * 12;
            tierHex.rotation.y = coreBaseTheta * 120;
            tierD12.rotation.y = coreBaseTheta * 720;

            strassenGroup.rotation.y = -coreBaseTheta * 0.5;

            strassenNodes.forEach((node, idx) => {
                const stData = node.parent.userData;
                stData.r1.rotation.x = (time * 8) + idx;
                stData.r2.rotation.y = (time * 12) + idx;
                stData.r3.rotation.z = (time * 16) + idx;

                let pulse = 0.5 + Math.sin(time * 32 + idx) * 0.5;
                node.scale.setScalar(1.0 + pulse * 0.5);
                node.material.emissiveIntensity = 0.5 + pulse * 0.8;
            });

            // Funnel Lines Dynamic Trace inside Core
            let _vSrc = new THREE.Vector3();
            let _vTgt = new THREE.Vector3();
            ttmptCoreGroup.updateMatrixWorld(true);
            const worldToCore = ttmptCoreGroup.matrixWorld.clone().invert();
            funnelLines.forEach(fl => {
                const dt = fl.userData;
                _vSrc.copy(dt.sVerts[dt.sourceIdx]).applyMatrix4(dt.sTier.matrixWorld);
                _vTgt.copy(dt.tVerts[dt.targetIdx]).applyMatrix4(dt.tTier.matrixWorld);
                _vSrc.applyMatrix4(worldToCore);
                _vTgt.applyMatrix4(worldToCore);

                const positions = fl.geometry.attributes.position.array;
                positions[0] = _vSrc.x; positions[1] = _vSrc.y; positions[2] = _vSrc.z;
                positions[3] = _vTgt.x; positions[4] = _vTgt.y; positions[5] = _vTgt.z;
                fl.geometry.attributes.position.needsUpdate = true;
            });

            let timeSincePulse = 0;
            if (pulseFrame >= 0) {
                let framesSince = currentFrame - pulseFrame;
                if (framesSince < 0) framesSince += MAX_FRAMES;
                if (framesSince < 300) timeSincePulse = framesSince * 0.05;
                else pulseFrame = -999;
            }
            let currentWaveRadius = timeSincePulse * pulseSpeed;
            const pulseOrigin = new THREE.Vector3(0,0,0);
            if(toroidalLerp > 0.5) pulseOrigin.set(0, -10, 0);

            let peakCompression = Math.sin(cycleRatio * Math.PI * 2 * 12) > 0.95;

            for(let i=0; i<voxels.length; i++) {
                let v = voxels[i];
                let bitDiv = document.getElementById(`bit-${i}`);

                v.group.position.lerpVectors(v.posCubic, v.posToroidal, toroidalLerp);
                v.distToCenter = v.group.position.distanceTo(pulseOrigin);

                let effectivePhase = v.phaseOffset;
                if(isOrthogonalMode) {
                    effectivePhase = (v.grid.x * Math.PI/2) + (v.grid.y * Math.PI/4) + (v.grid.z * Math.PI/8);
                }

                v.waveEnergy = 0;
                if (pulseFrame >= 0 && currentWaveRadius > 0) {
                    let waveDist = currentWaveRadius - v.distToCenter;
                    if (waveDist >= 0 && waveDist < 8.0) v.waveEnergy = 1.0 - (waveDist / 8.0);
                }

                v.energy = v.waveEnergy;
                let stepScale = 1.0;

                if (v.energy > 0.1) {
                    if (v.energy > 0.66) stepScale = 1.0;
                    else if (v.energy > 0.33) stepScale = 0.6;
                    else stepScale = 0.2;
                } else {
                    let localVibration = Math.sin(time * dynamicFreq + effectivePhase);
                    stepScale = 1.0 + (localVibration * dynamicAmp * 0.4);
                }

                let orthoStrain = isOrthogonalMode ? 1.2 : 1.0;
                v.solid.scale.set(stepScale, stepScale, stepScale * orthoStrain);
                v.wireframe.scale.set(stepScale, stepScale, stepScale * orthoStrain);
                v.gyroGroup.scale.set(stepScale, stepScale, stepScale * orthoStrain);

                let markovTime = time * dynamicFreq;
                v.ringOuter.rotation.z = markovTime * 12.0;
                v.ringMiddle.rotation.z = -markovTime * 1.2;
                v.ringInner.rotation.z = markovTime * 0.166;

                let tQuat = new THREE.Quaternion();
                let axis = new THREE.Vector3(Math.sin(time), Math.cos(time*0.5), Math.sin(effectivePhase)).normalize();

                let rotationalForce = (v.energy > 0.1 ? v.energy : dynamicSpin) * Math.PI * 0.2;
                tQuat.setFromAxisAngle(axis, rotationalForce);

                v.currentQuat.copy(v.baseQuat).multiply(tQuat);
                v.solid.quaternion.copy(v.currentQuat);
                v.wireframe.quaternion.copy(v.currentQuat);
                v.gyroGroup.quaternion.copy(v.currentQuat);
                v.localCentroid.quaternion.copy(v.currentQuat);

                // --- NEW: ROUTE ENERGY STRINGS DIRECTLY TO STRASSEN NODES ---
                if (toroidalLerp > 0.01) {
                    const mappedNode = strassenNodes[v.id % 12];
                    const p0 = new THREE.Vector3();
                    mappedNode.getWorldPosition(p0);

                    const p2 = v.group.position;
                    const windAngle = time + cycleRatio * Math.PI * 8;
                    const p1 = new THREE.Vector3(p2.x * 0.4, 10 + p2.y * 0.3, p2.z * 0.4);
                    p1.applyAxisAngle(new THREE.Vector3(0, 1, 0), windAngle + v.id * 0.1);

                    for (let j = 0; j < 50; j++) {
                        const t_curve = j / 49;
                        const inv = 1 - t_curve;
                        const x = inv*inv*p0.x + 2*inv*t_curve*p1.x + t_curve*t_curve*p2.x;
                        const y = inv*inv*p0.y + 2*inv*t_curve*p1.y + t_curve*t_curve*p2.y;
                        const z = inv*inv*p0.z + 2*inv*t_curve*p1.z + t_curve*t_curve*p2.z;
                        v.scalarString.pts[j*3] = x;
                        v.scalarString.pts[j*3+1] = y;
                        v.scalarString.pts[j*3+2] = z;
                    }
                    v.scalarString.mesh.geometry.attributes.position.needsUpdate = true;

                    let stringAlpha = toroidalLerp * (0.15 + v.energy * 0.85);
                    v.scalarString.mesh.material.opacity = stringAlpha;

                    if (v.energy > 0.1) {
                        v.scalarString.mesh.material.color.setHex(0x00ffcc);
                    } else {
                        const colorShift = new THREE.Color(0x8b5cf6).lerp(new THREE.Color(0xf59e0b), Math.sin(cycleRatio * Math.PI * 2 + v.id*0.2)*0.5 + 0.5);
                        v.scalarString.mesh.material.color.copy(colorShift);
                    }
                } else {
                    v.scalarString.mesh.material.opacity = 0;
                }

                // INTERACTION LOGGING (During peak decompression phase when exploded)
                if (peakCompression && toroidalLerp > 0.8 && v.bitValue === 1 && currentFrame !== lastPulseT) {
                    if (Math.random() > 0.98) { // Strict throttle to prevent ledger overflow
                        logLedger(`[T-${Math.round(currentFrame).toString().padStart(3,'0')}] D12-Coupling: Vx 0x${v.id.toString(16).toUpperCase()} &rarr; Strassen-${v.id % 12}`);
                        const spark = new THREE.Mesh(sparkGeo, sparkMat);
                        spark.position.copy(v.group.position);
                        scene.add(spark);
                        collisionSparks.push({mesh: spark, life: 1.0});
                    }
                }

                if(v.energy > 0.1) {
                    v.material.emissive.setHex(0xffffff);
                    v.material.emissiveIntensity = v.energy * 0.9;
                    bitDiv.classList.add('wave-active');
                    v.jtWireMat.color.setHex(0xffffff);
                    v.jtWireMat.opacity = 0.9;
                } else {
                    bitDiv.classList.remove('wave-active');
                    if(v.bitValue === 1) {
                        v.material.emissive.setHex(v.schema.hex);
                        v.material.emissiveIntensity = 0.4;
                    } else {
                        v.material.emissive.setHex(0x000000);
                    }
                    v.jtWireMat.color.setHex(0x888888);
                    v.jtWireMat.opacity = parseInt(document.getElementById('vis-wireframe').value) / 100;
                }
            }

            if (peakCompression) lastPulseT = currentFrame;

            // Spark Life Cycle
            for(let i=collisionSparks.length-1; i>=0; i--) {
                collisionSparks[i].life -= 0.05;
                collisionSparks[i].mesh.scale.setScalar(collisionSparks[i].life * 2.0);
                if(collisionSparks[i].life <= 0) {
                    scene.remove(collisionSparks[i].mesh);
                    collisionSparks.splice(i, 1);
                }
            }

            if(selectedVoxel) updateInspector();

            document.getElementById('fps-counter').innerText = (1/renderDelta).toFixed(1) + " FPS";
            renderer.render(scene, camera);
        }

        function updatePlayButton() {
            const button = document.getElementById('btn-play');
            button.textContent = isPlaying ? 'Pause motion' : 'Play motion';
            button.setAttribute('aria-pressed', String(isPlaying));
        }

        function syncSeedFromBits() {
            if (!voxels.length) return;
            let value = 0n;
            voxels.forEach(voxel => { value = (value << 1n) | BigInt(voxel.bitValue); });
            document.getElementById('packet-seed').value = value.toString(16).padStart(16, '0').toUpperCase();
        }

        function initializeSeedInput() {
            document.getElementById('seed-form').addEventListener('submit', event => {
                event.preventDefault();
                const input = document.getElementById('packet-seed');
                const seed = input.value.trim().replace(/^0x/i, '').replaceAll('_', '');
                const status = document.getElementById('seed-status');
                if (!/^[0-9a-f]{16}$/i.test(seed)) {
                    input.setAttribute('aria-invalid', 'true');
                    status.textContent = 'Enter exactly 16 hexadecimal digits (0–9, A–F).';
                    return;
                }
                input.removeAttribute('aria-invalid');
                const bits = BigInt('0x' + seed).toString(2).padStart(64, '0');
                voxels.forEach((voxel, index) => {
                    voxel.bitValue = Number(bits[index]);
                    const button = document.getElementById('bit-' + index);
                    button.querySelector('.bit-value').textContent = bits[index];
                    button.classList.toggle('bit-on', voxel.bitValue === 1);
                    button.setAttribute('aria-pressed', String(voxel.bitValue === 1));
                });
                parsePacketLogic();
                syncSeedFromBits();
                selectVoxel(0);
                status.textContent = 'Seed applied. Change any matrix bit to update its geometry.';
            });
        }

})();
