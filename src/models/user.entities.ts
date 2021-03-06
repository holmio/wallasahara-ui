export interface UserDetail {
  firsName: string;
  lastName: string;
  uuid: string;
  pictureURL: RoutePicture;
  email: string;
  lastSignInTime?: string;
  listOfItems?: Array<ItemOfUser>;
}

export interface UserUpdate {
  firsName: string;
  lastName: string;
  uuid: string;
  pictureURL: RoutePictureToUpdate;
  email: string;
}
export interface RoutePicture {
  pathOfBucket: string;
  pathOfImage: string;
}
export interface RoutePictureToUpdate {
  pathOfBucketOld: string;
  base64Image: string;
}

export interface ItemOfUser {
  uuid: string,
  isSold: boolean,
  price: number,
  profileItem: string,
  currency: string,
}
