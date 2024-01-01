BUILD_DIR := ./build
ptau := $(BUILD_DIR)/powersOfTau28_hez_final_20.ptau
CIRCUIR := ./circuits/qr_verify.circom
CIRLIB_PATH := ./node_modules
R1CS := $(BUILD_DIR)/qr_verify.r1cs
PARTIAL_ZKEYS := $(BUILD_DIR)/partial_zkeys

$(ptau):
	cd $(BUILD_DIR); \
	wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_20.ptau

compile-cir: $(CIRCUIR)
	circom $< --r1cs --wasm -o $(BUILD_DIR) -l $(CIRLIB_PATH)

trusted-setup: phase-1 phase-2

phase-1: $(ptau) $(R1CS) 
	yarn remove snarkjs
	yarn add snarkjs@git+https://github.com/vb7401/snarkjs.git#24981febe8826b6ab76ae4d76cf7f9142919d2b8
	yarn
	NODE_OPTIONS=--max-old-space-size=8192 \
	node ./node_modules/.bin/snarkjs groth16 setup $(R1CS) $(ptau) $(PARTIAL_ZKEYS)/circuit_0000.zkey

phase-2: $(PARTIAL_ZKEYS)/circuit_0000.zkeyb
	yarn remove snarkjs
	yarn add snarkjs@git+https://github.com/vb7401/snarkjs.git#24981febe8826b6ab76ae4d76cf7f9142919d2b8
	yarn
	echo "test random" | NODE_OPTIONS='--max-old-space-size=8192' \
	node ./node_modules/.bin/snarkjs zkey contribute $(PARTIAL_ZKEYS)/circuit_0000.zkey $(PARTIAL_ZKEYS)/circuit_final --name="1st Contributor Name" -v

.PHONY: build ptau