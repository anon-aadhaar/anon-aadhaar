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
    uint256 constant deltax1 = 5131497960133115608889639086277433862349256421502805029017384559051871824221;
    uint256 constant deltax2 = 9055479101913692142166073563143830090563910061200545576798274171474982984132;
    uint256 constant deltay1 = 11618439114065544598194951743936520352279509684195757700540650090706684088560;
    uint256 constant deltay2 = 19694059682728883012696426645143214793691711247720192880904225619966550096940;

    
    uint256 constant IC0x = 5761585982278393388250265181563927764316394450689718184257027468484516260080;
    uint256 constant IC0y = 938347409925992311882410726558545262954928341444685101828564604414566077810;
    
    uint256 constant IC1x = 8888086099875031013379491832738521651302999480641893109328937054288882618519;
    uint256 constant IC1y = 19313351188040994672746534249614842502782945198984978764115582142822194346789;
    
    uint256 constant IC2x = 8386719612166938859822395128265648503818705357851557613731395992931616997323;
    uint256 constant IC2y = 14309113436124086826213609500978686043582104955249683690675586024557415894045;
    
    uint256 constant IC3x = 6811334762139112766715060628810318810037206894006297889980306841279575919434;
    uint256 constant IC3y = 20240044695796100554507293438651562741828656905713889493510556227971944376839;
    
    uint256 constant IC4x = 3934835117730180295994485704538141517536030721004205720241408665760634801874;
    uint256 constant IC4y = 13301415962311020585114569820548818122038997876817775193347934308519202012101;
    
    uint256 constant IC5x = 62848987107656354842892415287940331576106216456938199901987252456799236115;
    uint256 constant IC5y = 8758652262932395384823793591767499417935198036499192537628612451078234075674;
    
    uint256 constant IC6x = 4653506510639751824833579899724893497095441129399276900723494742113395944490;
    uint256 constant IC6y = 9204513314349673607031461936427954129408945875309058755604608605769060308214;
    
    uint256 constant IC7x = 17338578195814973369940603123293673275161044105304509377385480235816604746764;
    uint256 constant IC7y = 9212410393715888059600286407751923047915673284153010289769986537830904177527;
    
    uint256 constant IC8x = 14014785743460197244061625282836350474261139241436688137907903847148631504631;
    uint256 constant IC8y = 15070998834682428295087420557325759941814725478309848239520039858921238272210;
    
    uint256 constant IC9x = 3099246290783986674787536267826550095911886740468827370287594240685708566717;
    uint256 constant IC9y = 3195643189156438875509082466380306946210416465080633585654353075498232565560;
    
    uint256 constant IC10x = 11056309321507985430754556265635708940034219665492082481462746467813456279385;
    uint256 constant IC10y = 4132905294561832678230380028621915062111406240106025450463972571287400068368;
    
    uint256 constant IC11x = 2836934715468011959601018151761163609231180767449232191529756027852682968930;
    uint256 constant IC11y = 18831002881283553861382333132945336685819095136267234199023760620051182805728;
    
    uint256 constant IC12x = 1413612434473014923197566429128230818404447438766825670648507579094087547080;
    uint256 constant IC12y = 9600952811575885742932548395386044191998038548094126347081431460212786943848;
    
    uint256 constant IC13x = 17086017401845095376134144410814887463981169236657826298930756646871155331462;
    uint256 constant IC13y = 15050061847641152135425247995508200755126846500525214448706248046591541113795;
    
    uint256 constant IC14x = 6783985403901001692066225991058929682211493397172491962065501235782592247202;
    uint256 constant IC14y = 3531902554104129769953997973812163481185071978536772213994671032095916710587;
    
    uint256 constant IC15x = 15427713706090448300755154855452563757865243076731945093681117514594783028382;
    uint256 constant IC15y = 19432109460944385967142794406057399002332777535456191529282463242259927440886;
    
    uint256 constant IC16x = 1555222681333680723963774969380193757241781896808830379265264658242553872933;
    uint256 constant IC16y = 1996677977962574645825532491072812387068266409199103420233684299698789800958;
    
    uint256 constant IC17x = 764926192873615442227849226791532742795277064264891635937793687346774947194;
    uint256 constant IC17y = 4460309199528159332043673352012144955187492192701692459085028540527146963368;
    
    uint256 constant IC18x = 4466920454602117773141006745741870363171713107272008877909310679338173264683;
    uint256 constant IC18y = 14963434597428835702287260580021615830957429313583032514905389833638903509771;
    
    uint256 constant IC19x = 11067304221123433976478626389661977456751383432316351764068504194188613984241;
    uint256 constant IC19y = 16039696388693545755520345451636355424844151601054468865346431521909156417782;
    
    uint256 constant IC20x = 21113404594815777078348107804122436635134899339013851156905804310944804743734;
    uint256 constant IC20y = 17895420266869345950240187957647948642940362921157887943045071380483798338624;
    
    uint256 constant IC21x = 20390949401289968301823103546419440211201789594736187544862425394593323356420;
    uint256 constant IC21y = 2371119697639157537656320104221321682983369334092279885466020125889544896567;
    
    uint256 constant IC22x = 568297476142708639758186536799208923966485756171200723725646409733191261570;
    uint256 constant IC22y = 10349341036871533433661582926493634136541855786194276716515651222728148216801;
    
    uint256 constant IC23x = 5330545378177935125693086896426176612225486004839063667908100215078684331227;
    uint256 constant IC23y = 11980316718918589092317955720177018035474801354271907511121279150598794886032;
    
    uint256 constant IC24x = 17458531890710994738326093922115055432252560945050512049292544976872558871215;
    uint256 constant IC24y = 21658790061419757406840867317101665543708397125023615706627586425630646669657;
    
    uint256 constant IC25x = 7709382221770304241031358030337354312656086573026489867874733397722893100567;
    uint256 constant IC25y = 1232207142363646652266855754439878143371024556311771464877119519619315625119;
    
    uint256 constant IC26x = 9560108413584745582118252121917029389806847671841190758370781251331969090167;
    uint256 constant IC26y = 3201412343778824796664521914144984275449500770270636967396106506067212419577;
    
    uint256 constant IC27x = 4159501818388908366376173127213501709068619980201577054906146381298751640730;
    uint256 constant IC27y = 5994942361633087402501474149493602519168733370852971552182267735077912834610;
    
    uint256 constant IC28x = 8882315063786858785629428658819258608192879394822736589261928891678740698824;
    uint256 constant IC28y = 13375206191110738958039301756707268576438069884600362967183323528028923217683;
    
    uint256 constant IC29x = 2330918941161159165188774882316791328058708598004219649247083342328812848758;
    uint256 constant IC29y = 8604553302870785703034636598610606417190032725631488020472604896891576572924;
    
    uint256 constant IC30x = 17791958609856728868187979836996973229892987904103771123097206759801561303643;
    uint256 constant IC30y = 2396292333961869987382456834224257468344819955970637532703233249988844927731;
    
    uint256 constant IC31x = 12699648249571088428025000068787195001327922922404948199869620725278184340261;
    uint256 constant IC31y = 14660765125625411872949007513572571472869970725736692230484652592973941965689;
    
    uint256 constant IC32x = 2519284289313809775143632980843473908491066458675757891064752834447738402958;
    uint256 constant IC32y = 14728061203616389825608072951786097664347581921628764131867928295428909164520;
    
    uint256 constant IC33x = 14589286055073145334690044732276549415263392397675407597356474387809795583225;
    uint256 constant IC33y = 8074400568334120039634968868152558674684439983741349381968829096042324606740;
    
    uint256 constant IC34x = 8414553842781109543575622912319448740554511497847852588431447279737988648847;
    uint256 constant IC34y = 18800368473685529178356308325959136569157218983699751777192672234600910274643;
    
 
    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[34] calldata _pubSignals) public view returns (bool) {
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
                
                g1_mulAccC(_pVk, IC33x, IC33y, calldataload(add(pubSignals, 1024)))
                
                g1_mulAccC(_pVk, IC34x, IC34y, calldataload(add(pubSignals, 1056)))
                

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
            
            checkField(calldataload(add(_pubSignals, 1056)))
            
            checkField(calldataload(add(_pubSignals, 1088)))
            

            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
             return(0, 0x20)
         }
     }
 }