/**
 * Servicio para generar previews de links (Open Graph)
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger.js';

class LinkPreviewService {
  /**
   * Extrae información Open Graph de una URL
   */
  async getPreview(url) {
    try {
      logger.info(`Obteniendo preview de: ${url}`);

      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);

      const preview = {
        url,
        title: this.extractMetaTag($, 'og:title') || $('title').text() || '',
        description: this.extractMetaTag($, 'og:description') ||
                     this.extractMetaTag($, 'description') || '',
        image: this.extractMetaTag($, 'og:image') || '',
        siteName: this.extractMetaTag($, 'og:site_name') || '',
        type: this.extractMetaTag($, 'og:type') || 'website'
      };

      logger.success(`Preview obtenido: ${preview.title}`);
      return preview;
    } catch (error) {
      logger.error(`Error obteniendo preview de ${url}`, error);

      // Retornar preview básico en caso de error
      return {
        url,
        title: url,
        description: '',
        image: '',
        siteName: '',
        type: 'website',
        error: error.message
      };
    }
  }

  /**
   * Extrae meta tags del HTML
   */
  extractMetaTag($, property) {
    return $(`meta[property="${property}"]`).attr('content') ||
           $(`meta[name="${property}"]`).attr('content') ||
           '';
  }

  /**
   * Detecta URLs en un texto
   */
  extractUrls(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  }

  /**
   * Obtiene previews de todas las URLs en un texto
   */
  async getPreviewsFromText(text) {
    const urls = this.extractUrls(text);

    if (urls.length === 0) {
      return [];
    }

    const previews = await Promise.all(
      urls.map(url => this.getPreview(url))
    );

    return previews;
  }
}

export const linkPreviewService = new LinkPreviewService();
