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

contract Verifier {
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
    uint256 constant deltax1 = 10670447150038412094764638092464051265872841093076019518143860639642060635312;
    uint256 constant deltax2 = 7269673071694555329829623951275703149369200667383437560831236002024650510675;
    uint256 constant deltay1 = 11125931132584371841236980826336991291058242123900717393264125463019472394383;
    uint256 constant deltay2 = 4082555195723360776359371512301327512060530133660179249127044411151126402638;

    
    uint256 constant IC0x = 16028465895964049502490678558809417235683213451318411323451368790100438200187;
    uint256 constant IC0y = 19389420058701719820409036630364176740133572318615644539431869869396355996406;
    
    uint256 constant IC1x = 19056609601965810892203102323463525694563020624836160804068545364328568111170;
    uint256 constant IC1y = 2778241474042390331385130789685611686278288226660364612713687611504300740720;
    
    uint256 constant IC2x = 13824694941158746200639706412798507395606172423478149635951018085209930501741;
    uint256 constant IC2y = 11459213799754435975330591227395707355942938396044057760289355697576417691401;
    
    uint256 constant IC3x = 12798142727445632191499435787115246025917593250242452457353949034639371466240;
    uint256 constant IC3y = 18053032594180740436957078064790983322851313022536981828227464396916029617028;
    
    uint256 constant IC4x = 9701321412275694857423277786143413340697138464796638514567650330691599172837;
    uint256 constant IC4y = 5731991725654477694203447904205147201404056149160031497890394914171175888861;
    
    uint256 constant IC5x = 19384408339865943449158065948487163657017253685351911470860570806340584772901;
    uint256 constant IC5y = 20435386114208608765117530617005566993249403003397513375227762988073318142384;
    
    uint256 constant IC6x = 5378941748168826767390133573718436538323610708294919580583181702015620356855;
    uint256 constant IC6y = 18243853058444074363786009243777291909697459016913701662220755348282517219058;
    
    uint256 constant IC7x = 13259698299233430760604106385464357393251584309031071226620989708020906992392;
    uint256 constant IC7y = 5118605763163255610117436600846474882771617767000697693016200615930077514878;
    
    uint256 constant IC8x = 10305416518419393527760807641607398804404362842085377170352777562324757389761;
    uint256 constant IC8y = 12849295076985258437250050819895769389041878260240548698672046713266867244846;
    
    uint256 constant IC9x = 14062440981666185994645292384449522359998813844602571441767738590079634404634;
    uint256 constant IC9y = 5435571536118484494914535244710321395542879944437315841119354784873979877414;
    
    uint256 constant IC10x = 1484018865619577588407351138667317539650791060502035544229109364716566378266;
    uint256 constant IC10y = 15365662599347326950686008355556733281956892676071074811700009775737774312079;
    
    uint256 constant IC11x = 20102715513415929351526507077844755981215486253575516815776827951193280165455;
    uint256 constant IC11y = 13586753207017434401570953683319762364630969732390623539114268665103516176537;
    
    uint256 constant IC12x = 10808683349601519999722775101787678701108135273647177228898683165851324006500;
    uint256 constant IC12y = 16051638336795927948554631893297577034865339319537483645096908635642972862524;
    
    uint256 constant IC13x = 14951477908965694779740690702214839201507078378144637359705168109082183011098;
    uint256 constant IC13y = 15944301634537346624644053523753266562876929658362022070690389968468678445735;
    
    uint256 constant IC14x = 8046753144044434216214328848512745642170554075691866308797562119947441176663;
    uint256 constant IC14y = 13138546747083577798353765216798348806072590639624095879792595751918903492953;
    
    uint256 constant IC15x = 9269841744461896652796424871767881077636845862896062313742276610868410367737;
    uint256 constant IC15y = 19204398179879155372339166209988729037117351201989323410307343855513763594307;
    
    uint256 constant IC16x = 7716881099355517822414707905850738186665313868979335283902370142936811833912;
    uint256 constant IC16y = 11528196729400489690891393487077421013615412514692179449654303318954736859528;
    
    uint256 constant IC17x = 5046803005209293905563542730106947483747999603892732318129931942914976300307;
    uint256 constant IC17y = 18359807028421021791710128712790840004739725878390496786442730043904799620775;
    
    uint256 constant IC18x = 7981969658925373733933252815358815642177002459779989502729025804210070642798;
    uint256 constant IC18y = 2201884520453602381757167226560048379234361443956248008351600855207748053326;
    
    uint256 constant IC19x = 2423450431733424040986489560227207633662164512765576249322846031854185964390;
    uint256 constant IC19y = 4932502478942742742955368234556279877956422961403016735993130979527534572419;
    
    uint256 constant IC20x = 4136066568774249110767040217927273928858469176929854865116246381005179602442;
    uint256 constant IC20y = 14910781990631332327444098879460029001183528084133380954744967860772990143548;
    
    uint256 constant IC21x = 9306442077615686666514943566045531276825026791237942942397956627887332762174;
    uint256 constant IC21y = 5453464967372952047053268732003513663945971520297600856947977773603507455690;
    
    uint256 constant IC22x = 13668279378191339240686523311787157905702403786071724115024939263519696082875;
    uint256 constant IC22y = 17015511864316463912130081097138575082002221925436737115301652345996774761994;
    
    uint256 constant IC23x = 11903142172414592342924720977734235164487862927368805935476433263236657614748;
    uint256 constant IC23y = 13172937375115616110879840408060964756231709365794854299281160685167078990257;
    
    uint256 constant IC24x = 14851933212838495488006105249354081780150791704393111451754186978257300101615;
    uint256 constant IC24y = 145540996971132661488497461982320053303230165053371395584307173765669751355;
    
    uint256 constant IC25x = 13492140304688249757734378821089945640145592582925007128524509462657370652800;
    uint256 constant IC25y = 9390414912955206153533825682501092416440637486304199868194459556400963016224;
    
    uint256 constant IC26x = 3496623709796463612824269552762145851578913713796096780105508335992863532011;
    uint256 constant IC26y = 20265982111402342744121770330588454353873018338721172861869003808234581001103;
    
    uint256 constant IC27x = 11129642812738675393866741757689241407730910968746319967156400192984156982663;
    uint256 constant IC27y = 7270648547566738015174758472940005793787550000213654707465902989385799417672;
    
    uint256 constant IC28x = 5336645303583636244521189039268557324541570944747369508544831506071145394833;
    uint256 constant IC28y = 19288570029059212549483359253619647241300370202409702983102892733256823930029;
    
    uint256 constant IC29x = 16583272323448913824043736762589960508623287550020508587844159466977422327617;
    uint256 constant IC29y = 7808423190665056416769605983838691330236789706587082822452001424004744554191;
    
    uint256 constant IC30x = 18660408822191296886711375730505189874857257159388446851193059936069141343915;
    uint256 constant IC30y = 7010768444553285503461992330222909022718986907742690725937070802247722257521;
    
    uint256 constant IC31x = 18362076977628428780847502863112204181768349745828739102417796831338046366054;
    uint256 constant IC31y = 21442620406111530168500515404464430908000908371506932655420247401742151555185;
    
    uint256 constant IC32x = 5162240315828150614443552770241127056707917547754134341853842620334081875585;
    uint256 constant IC32y = 15355077221254938058224342345720923978502202301865073779695296894696562882502;
    
 
    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[32] calldata _pubSignals) public view returns (bool) {
        assembly {
            function checkField(v) {
                if iszero(lt(v, q)) {
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
                
                g1_mulAccC(_pVk, IC19x, IC19y, calldataload(add(pubSignals, 576)))
                
                g1_mulAccC(_pVk, IC20x, IC20y, calldataload(add(pubSignals, 608)))
                
                g1_mulAccC(_pVk, IC21x, IC21y, calldataload(add(pubSignals, 640)))
                
                g1_mulAccC(_pVk, IC22x, IC22y, calldataload(add(pubSignals, 672)))
                
                g1_mulAccC(_pVk, IC23x, IC23y, calldataload(add(pubSignals, 704)))
                
                g1_mulAccC(_pVk, IC24x, IC24y, calldataload(add(pubSignals, 736)))
                
                g1_mulAccC(_pVk, IC25x, IC25y, calldataload(add(pubSignals, 768)))
                
                g1_mulAccC(_pVk, IC26x, IC26y, calldataload(add(pubSignals, 800)))
                
                g1_mulAccC(_pVk, IC27x, IC27y, calldataload(add(pubSignals, 832)))
                
                g1_mulAccC(_pVk, IC28x, IC28y, calldataload(add(pubSignals, 864)))
                
                g1_mulAccC(_pVk, IC29x, IC29y, calldataload(add(pubSignals, 896)))
                
                g1_mulAccC(_pVk, IC30x, IC30y, calldataload(add(pubSignals, 928)))
                
                g1_mulAccC(_pVk, IC31x, IC31y, calldataload(add(pubSignals, 960)))
                
                g1_mulAccC(_pVk, IC32x, IC32y, calldataload(add(pubSignals, 992)))
                

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
            
            checkField(calldataload(add(_pubSignals, 608)))
            
            checkField(calldataload(add(_pubSignals, 640)))
            
            checkField(calldataload(add(_pubSignals, 672)))
            
            checkField(calldataload(add(_pubSignals, 704)))
            
            checkField(calldataload(add(_pubSignals, 736)))
            
            checkField(calldataload(add(_pubSignals, 768)))
            
            checkField(calldataload(add(_pubSignals, 800)))
            
            checkField(calldataload(add(_pubSignals, 832)))
            
            checkField(calldataload(add(_pubSignals, 864)))
            
            checkField(calldataload(add(_pubSignals, 896)))
            
            checkField(calldataload(add(_pubSignals, 928)))
            
            checkField(calldataload(add(_pubSignals, 960)))
            
            checkField(calldataload(add(_pubSignals, 992)))
            
            checkField(calldataload(add(_pubSignals, 1024)))
            

            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
             return(0, 0x20)
         }
     }
 }
