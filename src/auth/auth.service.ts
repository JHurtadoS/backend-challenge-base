/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Injectable, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

@Injectable()
export class AuthService {
  private readonly supabaseClient: SupabaseClient<Database>;

  public constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
    const supabaseKey = this.configService.get<string>("SUPABASE_SERVICE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Supabase configuration is missing: SUPABASE_URL or SUPABASE_SERVICE_KEY is undefined.",
      );
    }

    this.supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);
  }

  public async register(email: string, password: string): Promise<string> {
    if (!email || !password) {
      throw new BadRequestException("Email and password are required.");
    }

    const { data, error } = await this.supabaseClient.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new BadRequestException(`Error registering user: ${error.message}`);
    }

    if (!data || !data.user) {
      throw new BadRequestException("User registration failed. No user data returned.");
    }

    const profile: ProfileInsert = {
      id: data.user.id,
      created_at: new Date().toISOString(),
    };

    const { error: profileError } = await this.supabaseClient.from("profiles").insert(profile);

    if (profileError) {
      throw new BadRequestException(`Error creating user profile: ${profileError.message}`);
    }

    return "User registered successfully!";
  }

  public async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; user: ProfileRow }> {
    if (!email || !password) {
      throw new BadRequestException("Email and password are required.");
    }

    const { data, error } = await this.supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException(`Error logging in: ${error.message}`);
    }

    if (!data || !data.session || !data.user) {
      throw new UnauthorizedException("Login failed. No session or user data returned.");
    }

    const { data: profile, error: profileError } = await this.supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      throw new UnauthorizedException(`Error fetching user profile: ${profileError.message}`);
    }

    if (!profile) {
      throw new UnauthorizedException("User profile not found.");
    }

    return {
      accessToken: data.session.access_token,
      user: profile,
    };
  }
}
