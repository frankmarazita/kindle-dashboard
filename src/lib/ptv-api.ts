import { createHmac } from "crypto";

interface PTVConfig {
  devId: string;
  apiKey: string;
}

interface Departure {
  stop_id: number;
  route_id: number;
  run_id: number;
  direction_id: number;
  scheduled_departure_utc: string;
  estimated_departure_utc?: string;
  at_platform: boolean;
  platform_number?: string;
}

interface Stop {
  stop_id: number;
  stop_name: string;
  stop_suburb: string;
  route_type: number;
}

interface Route {
  route_id: number;
  route_name: string;
  route_number: string;
  route_type: number;
}

interface Direction {
  direction_id: number;
  direction_name: string;
  route_id: number;
}

interface DeparturesResponse {
  departures: Departure[];
  stops: Record<string, Stop>;
  routes: Record<string, Route>;
  directions: Record<string, Direction>;
  status: {
    version: string;
    health: number;
  };
}

interface SearchResult {
  stops?: Stop[];
  routes?: Route[];
  status: {
    version: string;
    health: number;
  };
}

interface DirectionsForRouteResponse {
  directions: Direction[];
  status: {
    version: string;
    health: number;
  };
}

export class PTVApi {
  private readonly baseUrl = "https://timetableapi.ptv.vic.gov.au";
  private readonly devId: string;
  private readonly apiKey: string;

  constructor(config: PTVConfig) {
    this.devId = config.devId;
    this.apiKey = config.apiKey;
  }

  private generateSignature(request: string): string {
    const hmac = createHmac("sha1", this.apiKey);
    hmac.update(request);
    return hmac.digest("hex").toUpperCase();
  }

  private buildUrl(path: string, queryParams: Record<string, string> = {}): string {
    const params = new URLSearchParams(queryParams);
    params.set("devid", this.devId);

    const requestPath = `${path}?${params.toString()}`;
    const signature = this.generateSignature(requestPath);

    params.set("signature", signature);

    return `${this.baseUrl}${path}?${params.toString()}`;
  }

  async searchStops(searchTerm: string, routeTypes?: number[]): Promise<SearchResult> {
    const queryParams: Record<string, string> = {};

    if (routeTypes && routeTypes.length > 0) {
      queryParams.route_types = routeTypes.join(",");
    }

    const url = this.buildUrl(`/v3/search/${encodeURIComponent(searchTerm)}`, queryParams);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`PTV API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getDepartures(
    routeType: number,
    stopId: number,
    options: {
      maxResults?: number;
      directionId?: number;
      platformNumbers?: number[];
      expand?: string[];
    } = {}
  ): Promise<DeparturesResponse> {
    const queryParams: Record<string, string> = {};

    if (options.maxResults) {
      queryParams.max_results = options.maxResults.toString();
    }

    if (options.directionId !== undefined) {
      queryParams.direction_id = options.directionId.toString();
    }

    if (options.platformNumbers && options.platformNumbers.length > 0) {
      queryParams.platform_numbers = options.platformNumbers.join(",");
    }

    if (options.expand && options.expand.length > 0) {
      queryParams.expand = options.expand.join(",");
    }

    const url = this.buildUrl(
      `/v3/departures/route_type/${routeType}/stop/${stopId}`,
      queryParams
    );

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`PTV API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getDirectionsForRoute(routeId: number): Promise<DirectionsForRouteResponse> {
    const url = this.buildUrl(`/v3/directions/route/${routeId}`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`PTV API error: ${response.statusText}`);
    }

    return response.json();
  }
}
