import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
  InitArgs,
  init,
  generateArgs,
  prove,
  exportCallDataGroth16FromPCD,
  WASM_URL,
  ZKEY_URL,
  VK_URL,
} from '../../core/src'
import fs from 'fs'
import { BigNumberish } from 'ethers'

describe('VerifyProof', function () {
  this.timeout(0)

  let a: [BigNumberish, BigNumberish]
  let b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]]
  let c: [BigNumberish, BigNumberish]
  let publicInputs: BigNumberish[]
  const testQRData =
    '2374971804270526477833002468783965837992554564899874087591661303561346432389832047870524302186901344489362368642972767716416349990805756094923115719687656090691368051627957878187788907419297818953295185555346288172578594637886352753543271000481717080003254556962148594350559820352806251787713278744047402230989238559317351232114240089849934148895256488140236015024800731753594740948640957680138566468247224859669467819596919398964809164399637893729212452791889199675715949918925838319591794702333094022248132120531152523331442741730158840977243402215102904932650832502847295644794421419704633765033761284508863534321317394686768650111457751139630853448637215423705157211510636160227953566227527799608082928846103264491539001327407775670834868948113753614112563650255058316849200536533335903554984254814901522086937767458409075617572843449110393213525925388131214952874629655799772119820372255291052673056372346072235458198199995637720424196884145247220163810790179386390283738429482893152518286247124911446073389185062482901364671389605727763080854673156754021728522287806275420847159574631844674460263574901590412679291518508010087116598357407343835408554094619585212373168435612645646129147973594416508676872819776522537778717985070402222824965034768103900739105784663244748432502180989441389718131079445941981681118258324511923246198334046020123727749408128519721102477302359413240175102907322619462289965085963377744024233678337951462006962521823224880199210318367946130004264196899778609815012001799773327514133268825910089483612283510244566484854597156100473055413090101948456959122378865704840756793122956663218517626099291311352417342899623681483097817511136427210593032393600010728324905512596767095096153856032112835755780472808814199620390836980020899858288860556611564167406292139646289142056168261133256777093245980048335918156712295254776487472431445495668303900536289283098315798552328294391152828182614909451410115516297083658174657554955228963550255866282688308751041517464999930825273776417639569977754844191402927594739069037851707477839207593911886893016618794870530622356073909077832279869798641545167528509966656120623184120128052588408742941658045827255866966100249857968956536613250770326334844204927432961924987891433020671754710428050564671868464658436926086493709176888821257183419013229795869757265111599482263223604228286513011751601176504567030118257385997460972803240338899836840030438830725520798480181575861397469056536579877274090338750406459700907704031830137890544492015701251066934352867527112361743047684237105216779177819594030160887368311805926405114938744235859610328064947158936962470654636736991567663705830950312548447653861922078087824048793236971354828540758657075837209006713701763902429652486225300535997260665898927924843608750347193892239342462507130025307878412116604096773706728162016134101751551184021079984480254041743057914746472840768175369369852937574401874295943063507273467384747124843744395375119899278823903202010381949145094804675442110869084589592876721655764753871572233276245590041302887094585204427900634246823674277680009401177473636685542700515621164233992970974893989913447733956146698563285998205950467321954304'
  let certificate: string
  let user1addres: string

  this.beforeAll(async () => {
    const certificateDirName = __dirname + '/../../circuits/assets'
    certificate = fs
      .readFileSync(certificateDirName + '/uidai_prod_cdup.cer')
      .toString()

    const pcdInitArgs: InitArgs = {
      wasmURL: WASM_URL,
      zkeyURL: ZKEY_URL,
      vkeyURL: VK_URL,
      isWebEnv: true,
    }

    const [user1] = await ethers.getSigners()
    user1addres = user1.address

    await init(pcdInitArgs)

    const args = await generateArgs(testQRData, certificate, user1addres)

    const pcd = await prove(args)

    return ({ a, b, c, publicInputs } = await exportCallDataGroth16FromPCD(pcd))
  })

  async function deployOneYearLockFixture() {
    const Verifier = await ethers.getContractFactory('Verifier')
    const verifier = await Verifier.deploy()

    const _verifierAddress = await verifier.getAddress()

    const pubkeyHashBigInt = BigInt(
      '14283653287016348311748048156110700109007577525298584963450140859470242476430',
    ).toString()

    const AnonAadhaarContract = await ethers.getContractFactory('AnonAadhaar')
    const anonAadhaarVerifier = await AnonAadhaarContract.deploy(
      _verifierAddress,
      pubkeyHashBigInt,
    )

    const _AnonAadhaarAddress = await anonAadhaarVerifier.getAddress()

    const AnonAadhaarVote = await ethers.getContractFactory('AnonAadhaarVote')
    const anonAadhaarVote = await AnonAadhaarVote.deploy(
      'Do you like this app?',
      ['yes', 'no', 'maybe'],
      _AnonAadhaarAddress,
    )

    return {
      anonAadhaarVerifier,
      anonAadhaarVote,
    }
  }

  describe('AnonAadhaarVote Contract', function () {
    describe('verifyAnonAadhaarProof', function () {
      it('Should return true for a valid PCD proof', async function () {
        const { anonAadhaarVerifier } = await loadFixture(
          deployOneYearLockFixture,
        )

        expect(
          await anonAadhaarVerifier.verifyAnonAadhaarProof(
            a,
            b,
            c,
            publicInputs,
            user1addres,
          ),
        ).to.be.equal(true)
      })

      it('Should revert for a wrong signal', async function () {
        const { anonAadhaarVerifier } = await loadFixture(
          deployOneYearLockFixture,
        )

        await expect(
          anonAadhaarVerifier.verifyAnonAadhaarProof(a, b, c, publicInputs, 40),
        ).to.be.revertedWith('[AnonAadhaarVerifier]: wrong signal received')
      })
    })
  })

  describe('AnonAadhaar Vote', function () {
    describe('Vote for a proposal', function () {
      it('Should revert if signal is different from senderss address', async function () {
        const { anonAadhaarVote } = await loadFixture(deployOneYearLockFixture)

        const [, , user2] = await ethers.getSigners()

        await expect(
          (
            anonAadhaarVote.connect(user2) as typeof anonAadhaarVote
          ).voteForProposal(1, a, b, c, publicInputs, user1addres),
        ).to.be.revertedWith('[AnonAadhaarVote]: wrong user signal sent.')
      })

      it('Should verify a proof with right address in signal', async function () {
        const { anonAadhaarVote } = await loadFixture(deployOneYearLockFixture)

        await expect(
          anonAadhaarVote.voteForProposal(
            1,
            a,
            b,
            c,
            publicInputs,
            user1addres,
          ),
        ).to.emit(anonAadhaarVote, 'Voted')
      })
    })
  })
})
