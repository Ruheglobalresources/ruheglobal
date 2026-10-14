import { ZohoTokenManager, zohoBase, zohoDc } from "./oauth";
import { retrieveToken } from "./token-store";

export interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  leadSource?: string;
  description?: string;
}

type CreateLeadResponse = {
  data?: { code?: string; message?: string; details?: { id?: string } }[];
};

export class ZohoCrmClient {
  constructor(private auth: ZohoTokenManager) {}

  async createLead(lead: LeadData): Promise<{ id: string }> {
    const url = `${zohoBase(this.auth.dc)}/crm/v6/Leads`;
    const leadData = {
      ...(lead.firstName ? { First_Name: lead.firstName } : {}),
      Last_Name: lead.lastName,
      Email: lead.email,
      ...(lead.phone ? { Phone: lead.phone } : {}),
      ...(lead.leadSource ? { Lead_Source: lead.leadSource } : {}),
      ...(lead.description ? { Description: lead.description } : {}),
    };

    const result = await this.auth.request<CreateLeadResponse>(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: [leadData], trigger: [] }),
    });

    const row = result.data?.[0];
    const id = row?.details?.id;
    if (!id) {
      throw new Error(`Zoho did not create the lead: ${row?.code ?? "unknown"} ${row?.message ?? ""}`.trim());
    }
    return { id };
  }

  // Returns null when the integration is not set up yet (missing env vars or no stored token).
  static async create(): Promise<ZohoCrmClient | null> {
    const clientId = process.env.ZOHO_CRM_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CRM_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;

    const refreshToken = await retrieveToken("ZOHO_CRM_REFRESH_TOKEN");
    if (!refreshToken) return null;

    return new ZohoCrmClient(new ZohoTokenManager(clientId, clientSecret, refreshToken, zohoDc()));
  }
}