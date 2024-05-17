// SPDX-License-Identifier: GPL-3.0
/*
    Copyright 2021 0KIMS association.

    This file is generated with [snarkJS](https://github.com/iden3/snarkjs).

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/

pragma solidity >=0.7.0 <0.9.0;

contract Groth16Verifier {
    // Scalar field size
    uint256 constant r    = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    // Base field size
    uint256 constant q   = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    // Verification Key data
    uint256 constant alphax  = 20491192805390485299153009773594534940189261866228447918068658471970481763042;
    uint256 constant alphay  = 9383485363053290200918347156157836566562967994039712273449902621266178545958;
    uint256 constant betax1  = 4252822878758300859123897981450591353533073413197771768651442665752259397132;
    uint256 constant betax2  = 6375614351688725206403948262868962793625744043794305715222011528459656738731;
    uint256 constant betay1  = 21847035105528745403288232691147584728191162732299865338377159692350059136679;
    uint256 constant betay2  = 10505242626370262277552901082094356697409835680220590971873171140371331206856;
    uint256 constant gammax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant gammax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant gammay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant gammay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;
    uint256 constant deltax1 = 9415891443107504264639421551282985782304449902059033141529416117513223384319;
    uint256 constant deltax2 = 15129620381060475937162726978754978050428946545063839755154113907069881211222;
    uint256 constant deltay1 = 6405854340377572493732927559014084777864569531628852512434198114350323269323;
    uint256 constant deltay2 = 12289787973042803878466150477593963314573159186375484101474037816860178536737;

    
    uint256 constant IC0x = 3506394119145385094462608974525986997636217038455816082085627097104135906269;
    uint256 constant IC0y = 17581746824872757846881889416237353955036667581232034913131099124149697925427;
    
    uint256 constant IC1x = 17524207686112844746715073084064819097993988852542367154981142186726519201931;
    uint256 constant IC1y = 6542212334423183632801048614597647913352297195692651025435005033379169156629;
    
    uint256 constant IC2x = 1663243184816969662341500667541035557968298908111897826318871096192238108993;
    uint256 constant IC2y = 7796494164310005186281893916395458039479882114477918332395157290614032540958;
    
    uint256 constant IC3x = 1877905619351201538977985362189505761818125087298314444189802952713232790;
    uint256 constant IC3y = 17192322326005802078799911651463785622263830206975483410069538913160688455742;
    
    uint256 constant IC4x = 12722084210124545705186950303617582459988219929693839703779012460664282376072;
    uint256 constant IC4y = 1753774639677242611970663493972433163459320445514217970857643856446120076502;
    
    uint256 constant IC5x = 4054746171587603862857852942970426164894206643682661744156438227142168542896;
    uint256 constant IC5y = 4373254782352505620604992185802274056162338749337060335150023571284029623732;
    
    uint256 constant IC6x = 17890343342737945537536582146143045693470570175051248606501489749259607849872;
    uint256 constant IC6y = 1960510419686522941119198472112392660676997198996406188892870992557406045832;
    
    uint256 constant IC7x = 9239646274791047920617741513516893273810544253795471043151736379224289482942;
    uint256 constant IC7y = 6260825213282498650933520384417110724205432137887829959379872669437961182600;
    
    uint256 constant IC8x = 10208767186421848880055130862722161614141848944204876335341325997858261865636;
    uint256 constant IC8y = 18402205669109716898438839634688967088831797319401319984735144351324137675072;
    
    uint256 constant IC9x = 13057166271177388226137657082543994372857619911375403516126657079334903848436;
    uint256 constant IC9y = 18978025945263741719520200883996886390674987452922367189344531963447483595006;
    
    uint256 constant IC10x = 16742486026907677762399385943713253884826407740338083387207942937381773243285;
    uint256 constant IC10y = 20900086471583397150186659114894688833013819553514879525376593427419069739035;
    
    uint256 constant IC11x = 13163591445037794143272623328814769599540362338314233520191535436753005809409;
    uint256 constant IC11y = 20510320140726269439444530685232182352867932320747233941289232037801650462985;
    
    uint256 constant IC12x = 8620016569885094470431582889195318181702854229984701985760898614495674361043;
    uint256 constant IC12y = 14208648994032774911236103870697341653786746153209046298802157546475297153956;
    
    uint256 constant IC13x = 7532430871208551768561397798466109619229652240392104581146886173897156250826;
    uint256 constant IC13y = 15202712649341788314315796413546104852805122538290011841656209185521828434550;
    
    uint256 constant IC14x = 7169081112747776251936313528985545972824483824256499511752612399263841063408;
    uint256 constant IC14y = 19525143599658003578747191257533224234753004118633114254398631156844355011475;
    
    uint256 constant IC15x = 17232996837824281112530507044972701377121448064806320365831614742611347452316;
    uint256 constant IC15y = 18299146183349625855398054930311067852746450436010342777577254280767147342109;
    
    uint256 constant IC16x = 1939096755882999341068933218548705251445419612950051353605623866186006363042;
    uint256 constant IC16y = 8049148475584635425325995295082714012225747295323538011054788014328671976038;
    
    uint256 constant IC17x = 6730445273720583919305582602267710811390018020822454170560299602652912440361;
    uint256 constant IC17y = 18545439181763390469928813222910564324343928483994221738513064583018231875208;
    
    uint256 constant IC18x = 14665777905798106594756851855736289971524315135092677543476090765317104049796;
    uint256 constant IC18y = 16853927293305787786043211054504957636726002045193674754039076888377025054664;
    
 
    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[18] calldata _pubSignals) public view returns (bool) {
        assembly {
            function checkField(v) {
                if iszero(lt(v, r)) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }
            
            // G1 function to multiply a G1 value(x,y) to value in an address
            function g1_mulAccC(pR, x, y, s) {
                let success
                let mIn := mload(0x40)
                mstore(mIn, x)
                mstore(add(mIn, 32), y)
                mstore(add(mIn, 64), s)

                success := staticcall(sub(gas(), 2000), 7, mIn, 96, mIn, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }

                mstore(add(mIn, 64), mload(pR))
                mstore(add(mIn, 96), mload(add(pR, 32)))

                success := staticcall(sub(gas(), 2000), 6, mIn, 128, pR, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }

            function checkPairing(pA, pB, pC, pubSignals, pMem) -> isOk {
                let _pPairing := add(pMem, pPairing)
                let _pVk := add(pMem, pVk)

                mstore(_pVk, IC0x)
                mstore(add(_pVk, 32), IC0y)

                // Compute the linear combination vk_x
                
                g1_mulAccC(_pVk, IC1x, IC1y, calldataload(add(pubSignals, 0)))
                
                g1_mulAccC(_pVk, IC2x, IC2y, calldataload(add(pubSignals, 32)))
                
                g1_mulAccC(_pVk, IC3x, IC3y, calldataload(add(pubSignals, 64)))
                
                g1_mulAccC(_pVk, IC4x, IC4y, calldataload(add(pubSignals, 96)))
                
                g1_mulAccC(_pVk, IC5x, IC5y, calldataload(add(pubSignals, 128)))
                
                g1_mulAccC(_pVk, IC6x, IC6y, calldataload(add(pubSignals, 160)))
                
                g1_mulAccC(_pVk, IC7x, IC7y, calldataload(add(pubSignals, 192)))
                
                g1_mulAccC(_pVk, IC8x, IC8y, calldataload(add(pubSignals, 224)))
                
                g1_mulAccC(_pVk, IC9x, IC9y, calldataload(add(pubSignals, 256)))
                
                g1_mulAccC(_pVk, IC10x, IC10y, calldataload(add(pubSignals, 288)))
                
                g1_mulAccC(_pVk, IC11x, IC11y, calldataload(add(pubSignals, 320)))
                
                g1_mulAccC(_pVk, IC12x, IC12y, calldataload(add(pubSignals, 352)))
                
                g1_mulAccC(_pVk, IC13x, IC13y, calldataload(add(pubSignals, 384)))
                
                g1_mulAccC(_pVk, IC14x, IC14y, calldataload(add(pubSignals, 416)))
                
                g1_mulAccC(_pVk, IC15x, IC15y, calldataload(add(pubSignals, 448)))
                
                g1_mulAccC(_pVk, IC16x, IC16y, calldataload(add(pubSignals, 480)))
                
                g1_mulAccC(_pVk, IC17x, IC17y, calldataload(add(pubSignals, 512)))
                
                g1_mulAccC(_pVk, IC18x, IC18y, calldataload(add(pubSignals, 544)))
                

                // -A
                mstore(_pPairing, calldataload(pA))
                mstore(add(_pPairing, 32), mod(sub(q, calldataload(add(pA, 32))), q))

                // B
                mstore(add(_pPairing, 64), calldataload(pB))
                mstore(add(_pPairing, 96), calldataload(add(pB, 32)))
                mstore(add(_pPairing, 128), calldataload(add(pB, 64)))
                mstore(add(_pPairing, 160), calldataload(add(pB, 96)))

                // alpha1
                mstore(add(_pPairing, 192), alphax)
                mstore(add(_pPairing, 224), alphay)

                // beta2
                mstore(add(_pPairing, 256), betax1)
                mstore(add(_pPairing, 288), betax2)
                mstore(add(_pPairing, 320), betay1)
                mstore(add(_pPairing, 352), betay2)

                // vk_x
                mstore(add(_pPairing, 384), mload(add(pMem, pVk)))
                mstore(add(_pPairing, 416), mload(add(pMem, add(pVk, 32))))


                // gamma2
                mstore(add(_pPairing, 448), gammax1)
                mstore(add(_pPairing, 480), gammax2)
                mstore(add(_pPairing, 512), gammay1)
                mstore(add(_pPairing, 544), gammay2)

                // C
                mstore(add(_pPairing, 576), calldataload(pC))
                mstore(add(_pPairing, 608), calldataload(add(pC, 32)))

                // delta2
                mstore(add(_pPairing, 640), deltax1)
                mstore(add(_pPairing, 672), deltax2)
                mstore(add(_pPairing, 704), deltay1)
                mstore(add(_pPairing, 736), deltay2)


                let success := staticcall(sub(gas(), 2000), 8, _pPairing, 768, _pPairing, 0x20)

                isOk := and(success, mload(_pPairing))
            }

            let pMem := mload(0x40)
            mstore(0x40, add(pMem, pLastMem))

            // Validate that all evaluations ∈ F
            
            checkField(calldataload(add(_pubSignals, 0)))
            
            checkField(calldataload(add(_pubSignals, 32)))
            
            checkField(calldataload(add(_pubSignals, 64)))
            
            checkField(calldataload(add(_pubSignals, 96)))
            
            checkField(calldataload(add(_pubSignals, 128)))
            
            checkField(calldataload(add(_pubSignals, 160)))
            
            checkField(calldataload(add(_pubSignals, 192)))
            
            checkField(calldataload(add(_pubSignals, 224)))
            
            checkField(calldataload(add(_pubSignals, 256)))
            
            checkField(calldataload(add(_pubSignals, 288)))
            
            checkField(calldataload(add(_pubSignals, 320)))
            
            checkField(calldataload(add(_pubSignals, 352)))
            
            checkField(calldataload(add(_pubSignals, 384)))
            
            checkField(calldataload(add(_pubSignals, 416)))
            
            checkField(calldataload(add(_pubSignals, 448)))
            
            checkField(calldataload(add(_pubSignals, 480)))
            
            checkField(calldataload(add(_pubSignals, 512)))
            
            checkField(calldataload(add(_pubSignals, 544)))
            
            checkField(calldataload(add(_pubSignals, 576)))
            

            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
             return(0, 0x20)
         }
     }
 }
