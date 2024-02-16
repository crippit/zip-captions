import { createReducer, on } from '@ngrx/store';
import { UserActions } from '../actions/user.actions';
import { SettingsState } from '../modules/settings/models/settings.model';

export const userFeatureKey = 'user';

export interface UserProfile {
  id: string;
  primaryEmail: string;
  createdAt: string;
  familyName?: string;
  givenName?: string;
  organizationName?: string;
}

export interface UserState {
  profile?: UserProfile;
  savedSettings?: SettingsState;
}

export const defaultUserState: UserState = {
};

export const userReducer = createReducer(
  defaultUserState,
  on(UserActions.setProfile, (state: UserState, action: { profile: UserProfile }) => ({...state, profile: action.profile})),
  on(UserActions.clearProfile, (state: UserState) => ({...state, profile: undefined }))
);

