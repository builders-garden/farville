export interface DbUserDonation {
  lastDonation: Date;
  donatorFid: number;
  receiverFid: number;
  times: number | null;
}
