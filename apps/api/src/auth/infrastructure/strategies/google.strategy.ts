import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport';
import { Strategy } from 'passport-google-oauth20';

interface GoogleProfile extends Profile {
	id: string;
	displayName: string;
	emails: { value: string }[];
}

export interface GoogleUser {
	googleId: string;
	email: string;
	name: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor(config: ConfigService) {
		super({
			clientID: config.get('GOOGLE_CLIENT_ID')!,
			clientSecret: config.get('GOOGLE_CLIENT_SECRET')!,
			callbackURL: config.get('GOOGLE_CALLBACK_URL')!,
			scope: ['email', 'profile'],
			passReqToCallback: true,
		});
	}

	validate(
		accessToken: string,
		refreshToken: string,
		profile: Profile,
	): GoogleUser {
		const googleProfile = profile as GoogleProfile;

		if (
			!googleProfile.emails ||
			googleProfile.emails.length === 0 ||
			!googleProfile.emails[0]
		) {
			throw new Error('No email found in Google profile');
		}

		return {
			googleId: googleProfile.id,
			email: googleProfile.emails[0].value,
			name: googleProfile.displayName || '',
		};
	}
}
