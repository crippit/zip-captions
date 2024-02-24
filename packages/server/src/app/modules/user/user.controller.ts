import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { NoCache } from '../../decorators/no-cache.decorator';
import { AzureOAuthGuard } from '../../guards/azure-oauth.guard';
import { GoogleOAuthGuard } from '../../guards/google-oauth.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { UserProfile } from './models/user.model';
import { UserService } from './services/user.service';
import { UiSettingsService } from './services/ui-settings.service';
import { UiSettings, UiSettingsDocument } from './models/ui-settings.model';

@Controller('user')
export class UserController {
  
  private clientUrl: string;
  constructor(private readonly userService: UserService,
              private readonly uiSettingsService: UiSettingsService,
              private jwtService: JwtService) 
  {
    this.clientUrl = process.env.APP_ORIGIN
  }

  @Get('profile/:id')
  @UseGuards(JwtAuthGuard)
  async getUser(@Req() req, @Param() params: { id: string }): Promise<UserProfile> {
    if (params.id !== req.user.id) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
    }
    const user = await this.userService.findOne({id: req.user.id});
    const userProfile = {
      id: user.id,
      createdAt: user.createdAt.toString(),
      familyName: user.familyName,
      givenName: user.givenName,
      primaryEmail: user.primaryEmail,
      googleConnected: !!user.googleId,
      azureConnected: !!user.msId
    }
    return userProfile;
  }

  @Get('profile/:id/settings')
  @UseGuards(JwtAuthGuard)
  async getSettings(@Req() req, @Param() params: { id: string }): Promise<Partial<UiSettings> | null> {
    this._validateParam(req, params);
    const settings = await this.uiSettingsService.findByOwnerId(params.id);
    if (settings) {
      return this._pruneSettingsFields(settings)
    }
    return null;
  }

  @Post('profile/:id/settings')
  @UseGuards(JwtAuthGuard)
  async saveSettings(@Req() req, @Param() params: { id: string}, @Body() body): Promise<Partial<UiSettings>> {
    if (params.id !== req.user.id) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
    }
    const settings = await this.uiSettingsService.upsert({...body.settings, ownerId: params.id });
    return this._pruneSettingsFields(settings);
  }

  @Get('validate')
  @NoCache()
  @UseGuards(JwtAuthGuard)
  async validate(@Req() req): Promise<{id: string} | null> {
    if ((req.user?.exp * 1000) > Date.now()) {
      return {id: req.user.id}
    }
    return null
  }

  @Get('google-login')
  @NoCache()
  @UseGuards(GoogleOAuthGuard)
  googleAuth(@Req() req) {
      console.log('login with google')
  }

  @Get('azure-login')
  @NoCache()
  @UseGuards(AzureOAuthGuard)
  azureAuth(@Req() req) {
    console.log('login with azure')
  }

  @Get('google-redirect')
  @NoCache()
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res) {
    try {
      const user = await this.userService.googleLogin(req);
      this._sendTokenResponse(user.id, res);
    } catch(e) {
      console.error(e)
      res.redirect(`${this.clientUrl}/auth/login?error=${encodeURIComponent(e)}`)
    }
  }

  @Get('azure-redirect')
  @NoCache()
  @UseGuards(AzureOAuthGuard)
  async azureAuthRedirect(@Req() req, @Res() res) {
    try {
      if (req.authInfo?.message) {
        throw new Error('No user from microsoft');
      }
      const user = await this.userService.msLogin(req.user);
      this._sendTokenResponse(user.id, res);
    } catch(e: any) {
      console.error(e);
      res.redirect(`${this.clientUrl}/auth/login?error=${encodeURIComponent(e)}`)
    }
  }

  @Post('logout')
  @NoCache()
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req, @Res() res) {
    await req.logout((err) => {
      if (err) {
        console.warn(err)
        Promise.reject(err)
      }
      Promise.resolve('OK')
    })
    res.status(200).send('OK')
  }

  private _sendTokenResponse(userId: string, res: Response): void {
    const token = this.jwtService.sign({ sub: userId })
    res.redirect(`${this.clientUrl}/auth/login?id_token=${token}`);
  }

  private _validateParam(req: { user: { id: string }}, params: { id: string }): void {
    if (params.id !== req.user.id) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
    }
  }

  private _pruneSettingsFields(settings: UiSettingsDocument): Partial<UiSettings> {
    const converted = settings.toJSON({versionKey: false});
    delete converted.ownerId;
    delete converted._id;
    return converted;
  }
  
}
