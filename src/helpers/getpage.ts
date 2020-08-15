import axios, {AxiosRequestConfig} from 'axios';
import cheerio from 'cheerio';

export default async function (url: string, config?: AxiosRequestConfig): Promise<CheerioStatic> {
    const body = await axios.get<string>(encodeURI(url), config);
    return cheerio.load(body.data);
}
