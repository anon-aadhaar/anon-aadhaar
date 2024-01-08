export const enum SELECTOR_ID {
  emailOrPhone = 0,
  referenceId,
  name,
  dob,
  gender,
  cafeof,
  district,
  landmark,
  house,
  location,
  pinCode,
  postOffice,
  state,
  stress,
  subDistrict,
  VTC,
}

export class SelectorBuilder {
  selector: number[]

  constructor() {
    this.selector = new Array(16).fill(0)
  }

  selectEmailOrPhone() {
    this.selector[0] = 1
    return this
  }

  selectReferenceId() {
    this.selector[1] = 1
    return this
  }
  selectName() {
    this.selector[2] = 1
    return this
  }
  selectDoB() {
    this.selector[3] = 1
    return this
  }
  selectGender() {
    this.selector[4] = 1
    return this
  }
  selectCafeof() {
    this.selector[5] = 1
    return this
  }
  selectDistrict() {
    this.selector[6] = 1
    return this
  }
  selectLandmark() {
    this.selector[7] = 1
    return this
  }
  selectHouse() {
    this.selector[8] = 1
    return this
  }
  selectLocation() {
    this.selector[9] = 1
    return this
  }
  selectPinCode() {
    this.selector[10] = 1
    return this
  }
  selectPostOffice() {
    this.selector[11] = 1
    return this
  }
  selectState() {
    this.selector[12] = 1
    return this
  }
  selectStress() {
    this.selector[13] = 1
    return this
  }
  selectSubDistrict() {
    this.selector[14] = 1
    return this
  }
  selectVTC() {
    this.selector[15] = 1
    return this
  }

  build() {
    return this.selector
  }
}
