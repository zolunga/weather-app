import { currentWeatherFixture, forecastItemFixture } from '../test/weather-fixtures';
import { getCurrentWeather, getForecastWeather } from './weather.api';

describe('weather.api', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('builds the correct current weather request URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(currentWeatherFixture), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await getCurrentWeather({ location: 'Atlanta, GA', units: 'imperial' });

    const requestedUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(requestedUrl.origin).toBe('http://localhost:3000');
    expect(requestedUrl.pathname).toBe('/weather/current');
    expect(requestedUrl.searchParams.get('location')).toBe('Atlanta, GA');
    expect(requestedUrl.searchParams.get('units')).toBe('imperial');
  });

  it('builds the correct forecast request URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          location: currentWeatherFixture.location,
          items: [forecastItemFixture],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await getForecastWeather({ location: 'Atlanta', units: 'metric' });

    const requestedUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(requestedUrl.origin).toBe('http://localhost:3000');
    expect(requestedUrl.pathname).toBe('/weather/forecast');
    expect(requestedUrl.searchParams.get('location')).toBe('Atlanta');
    expect(requestedUrl.searchParams.get('units')).toBe('metric');
  });
});
