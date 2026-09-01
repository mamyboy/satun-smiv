/**
 * Central registry of HDC indicators this project extracts.
 * Add a new indicator here, then run:
 *   node scripts/extract-indicator.js <key>
 *
 * filterByAmphoe:
 *   true  -> script drives the real "อำเภอ" ngx-select dropdown and loops
 *            through every district, extracting one table per district.
 *   false -> script clicks "ดูรายงาน" once (province-level report) and
 *            extracts a single table, no dropdown interaction needed.
 *
 * mode: 'facilityByAmphoe' (used with filterByAmphoe: false) ->
 *   first switches the "มุมมองการแสดงข้อมูล" view-mode dropdown to the
 *   `viewMode` option (e.g. "รายหน่วยบริการ"), then loops through every
 *   อำเภอ dropdown option same as filterByAmphoe, extracting one
 *   facility-level table per district.
 */

module.exports = {
  indicator1: {
    reportCode: '342c01cf6fd12450b7271740642df5a3',
    name: 'จำนวนผู้ป่วยจิตเวชที่มีความเสี่ยงต่อการก่อความรุนแรง (SMI-V)ที่มารับบริการในปีงบประมาณ(คนต่อสถานพยาบาล) จำแนกตามการวินิจฉัย',
    filterByAmphoe: true,
    outputDir: 'indicator1'
  },
  indicator2: {
    reportCode: 'r3yveog8x2yk4ug0tca4z',
    name: 'ร้อยละของผู้ป่วยจิตเวชสารเสพติดก่อความรุนแรง (SMI-V) ในเขตสุขภาพเข้าถึงบริการได้รับการดูแลต่อเนื่องและไม่ก่อความรุนแรงซ้ำ',
    filterByAmphoe: false,
    outputDir: 'indicator2'
  },
  indicator3: {
    reportCode: '1b64b51e4bf2edb57d2ddd1c316d48b1',
    name: 'ร้อยละผู้ป่วยจิตเวชที่มีความเสี่ยงสูงต่อการก่อความรุนแรง (SMI-V) ไม่ก่อความรุนแรงซ้า',
    filterByAmphoe: false,
    mode: 'facilityByAmphoe',
    viewMode: 'รายหน่วยบริการ',
    outputDir: 'indicator3'
  },
  indicator4: {
    reportCode: 'pepa25tv0dy1coasj2c8w',
    name: 'จำนวนผู้ป่วยจิตเวชยาเสพติดก่อความรุนแรง (SMI-V) ที่ขาดการรักษาก่อความรุนแรงซ้ำจำแนกตามประเภทความรุนแรง ที่มารับการรักษาในปีงบประมาณ',
    filterByAmphoe: false,
    outputDir: 'indicator4'
  },
  indicator5: {
    reportCode: 'f76033a904fdd49edb0f99657b44550c',
    name: 'ร้อยละผู้ป่วยจิตเวชที่มีความเสี่ยงสูงต่อการก่อความรุนแรง (SMI-V) ได้รับการติดตาม ดูแลเฝ้าระวัง ตามแนวทางที่กำหนด (Workload)',
    filterByAmphoe: false,
    mode: 'facilityByAmphoe',
    viewMode: 'รายหน่วยบริการ',
    outputDir: 'indicator5'
  },
  indicator_relate_14: {
    reportCode: 'e8e6d6e5a088228680d4be573d712de0',
    name: 'ร้อยละของผู้ป่วยโรคจิตเภทได้รับการรักษาต่อเนื่องภายใน 6 เดือน',
    filterByAmphoe: false,
    outputDir: 'indicator_relate_14'
  },
  indicator_relate_15: {
    reportCode: 'ceea5aba6208937d4d44f3141271fc0d',
    name: 'ร้อยละของผู้ป่วยจิตเภทที่เข้าถึงบริการสะสมได้รับการดูแลต่อเนื่อง',
    filterByAmphoe: false,
    outputDir: 'indicator_relate_15'
  },
  indicator_relate_16: {
    reportCode: '70404ef102ed96de4e2914e2facb67a2',
    name: 'ร้อยละของผู้ป่วยโรคจิตเภทได้รับการรักษาต่อเนื่องภายใน 6 เดือน(Reverse )',
    filterByAmphoe: false,
    outputDir: 'indicator_relate_16'
  },
  indicator_relate_21_1: {
    reportCode: '9cf1a79f90362e5d168187a784d0eea3',
    name: 'ร้อยละของผู้ป่วยที่มีความผิดปกติทางจิตและพฤติกรรมที่เกิดจากการใช้สารออกฤทธิ์ต่อจิตประสาท จำแนกตามภูมิลำเนา',
    filterByAmphoe: false,
    outputDir: 'indicator_relate_21_1'
  },
  indicator_relate_21_2: {
    reportCode: '4b2cd479a6c870d9691a272337164dd1',
    name: 'ร้อยละของผู้ป่วยที่มีความผิดปกติทางจิตและพฤติกรรมที่เกิดจากการใช้สารออกฤทธิ์ต่อจิตประสาท จำแนกตามสถานพยาบาล (workload)',
    filterByAmphoe: false,
    outputDir: 'indicator_relate_21_2'
  },
  indicator_relate_21_4: {
    reportCode: '0b831e13fcaf69d5ce7b3a6b4f99475d',
    name: 'ร้อยละผู้ป่วยที่มีความผิดปกติทางจิตและพฤติกรรมที่เกิดจากการใช้สารออกฤทธิ์ต่อจิตประสาทที่มีโรคร่วมทางจิต ตามภูมิลำเนา',
    filterByAmphoe: false,
    outputDir: 'indicator_relate_21_4'
  },
  indicator_relate_21_5: {
    reportCode: 'e9e520871e1315dabbbcc445c202bef0',
    name: 'ร้อยละผู้ป่วยที่มีความผิดปกติทางจิตและพฤติกรรมที่เกิดจากการใช้สารออกฤทธิ์ต่อจิตประสาทที่มีโรคร่วมทางจิต จำแนกตามสถานพยาบาล (workload)',
    filterByAmphoe: false,
    outputDir: 'indicator_relate_21_5'
  },
  indicator_relate_21_6: {
    reportCode: '15fMKXwoiQVGRuR',
    name: 'ร้อยละของผู้ป่วยที่มีความผิดปกติทางจิตและพฤติกรรมที่เกิดจากการใช้สารออกฤทธิ์ต่อจิตประสาทที่เข้าสู่กระบวนการบำบัดรักษาได้รับการดูแลและติดตามต่อเนื่อง (Retention Rate)',
    filterByAmphoe: false,
    outputDir: 'indicator_relate_21_6'
  },
  indicator_relate_21_7: {
    reportCode: 'c5hk6azonn9bywrn8hist',
    name: 'อัตราการเข้าถึงบริการของผู้ป่วยที่มีความผิดปกติทางจิตและพฤติกรรมที่เกิดจากการใช้สารออกฤทธิ์ต่อจิตประสาท',
    filterByAmphoe: false,
    outputDir: 'indicator_relate_21_7'
  },
  indicator_relate_22_1: {
    reportCode: '5add72ba460b126be0929c21667c0636',
    name: 'จำนวนและร้อยละของความผิดปกติทางจิตและพฤติกรรม (F00.xx-F99.xx) หรือตั้งใจทำร้ายตนเอง (X60.xx-X84.xx) หรือถูกทำร้าย (X85.xx-X99.xx, Y00.xx-Y09.xx) จำแนกตามกลุ่มอายุและเพศ',
    filterByAmphoe: false,
    outputDir: 'indicator_relate_22_1'
  },
  indicator_relate_22_2: {
    reportCode: 'e6578ef27efb28c69fa25de79eb7a000',
    name: 'จำนวนและร้อยละของความผิดปกติทางจิตและพฤติกรรม (F00.xx-F99.xx) หรือตั้งใจทำร้ายตนเอง (X60.xx-X84.xx) หรือถูกทำร้าย (X85.xx-X99.xx, Y00.xx-Y09.xx) จำแนกตามพื้นที่และเพศ',
    filterByAmphoe: false,
    outputDir: 'indicator_relate_22_2'
  },
  indicator_relate_22_3: {
    reportCode: '3865906d6555a8903a8ae3d3e4dc7024',
    name: 'จำนวน (คน/ครั้ง) ของความผิดปกติทางจิตและพฤติกรรม (F00.xx-F99) หรือตั้งใจทำร้ายตนเอง (X60.xx-X84.xx) หรือ ถูกทำร้าย (X85.xx-X99, Y00-Y09) จําแนกตามเพศ กลุ่มโรค และรายโรค (workload)',
    filterByAmphoe: false,
    outputDir: 'indicator_relate_22_3'
  },
  indicator_relate_22_4: {
    reportCode: '40afe7e032874b75b492bc9d46f6d909',
    name: 'จำนวน(คน/ครั้ง)ตั้งใจทำร้ายตนเอง (X60.xx-X84.xx) จำแนกตามพื้นที่',
    filterByAmphoe: false,
    outputDir: 'indicator_relate_22_4'
  },
  indicator_relate_22_5: {
    reportCode: '8u91ulb626yzilvvqw9bu',
    name: 'จำนวนและร้อยละวิธีทำร้ายตนเองของการตั้งใจทำร้ายตนเอง (X60.xx-X84.xx) จำแนกตามพื้นที่เกิดเหตุ',
    filterByAmphoe: false,
    outputDir: 'indicator_relate_22_5'
  },
  indicator_relate_22_6: {
    reportCode: '52azv70odguyfeo9hozj4',
    name: 'จำนวนและร้อยละของวิธีทำร้ายตนเองของการตั้งใจทำร้ายตนเอง (X60.xx-X84.xx) จำแนกตามสถานที่เกิดเหตุ',
    filterByAmphoe: false,
    outputDir: 'indicator_relate_22_6'
  },
  indicator_relate_22_7: {
    reportCode: '52azv70odguyfeo9hozj3',
    name: 'จำนวนและร้อยละของวิธีทำร้ายตนเองของการตั้งใจทำร้ายตนเอง (X60.xx-X84.xx) จำแนกตามช่วงเวลาเกิดเหตุ',
    filterByAmphoe: false,
    outputDir: 'indicator_relate_22_7'
  },
  indicator_relate_23_4: {
    reportCode: '5d5aa8ea9ee75a5990950984f5a81403',
    name: 'อัตราป่วยรายใหม่และความชุกของโรคจิตเภท (F20.xx)',
    filterByAmphoe: false,
    outputDir: 'indicator_relate_23_4'
  },
  indicator_relate_23_5: {
    reportCode: '1db90fb003cd7f63b4f1b39f1ca00752',
    name: 'อัตราป่วยรายใหม่และความชุกของภาวะเมเนียและโรคอารมณ์สองขั้ว (F30.xx-F31.xx)',
    filterByAmphoe: false,
    outputDir: 'indicator_relate_23_5'
  },
  indicator_relate_23_6: {
    reportCode: '498d921b3210037891f4f2080df1b4f9',
    name: 'อัตราป่วยรายใหม่และความชุกของโรคซึมเศร้า (F32.xx, F33.xx, F34.1x, F38.xx, F39.xx)',
    filterByAmphoe: false,
    outputDir: 'indicator_relate_23_6'
  }
};
