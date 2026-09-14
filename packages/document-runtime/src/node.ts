/**
 * Node-only Document Runtime API.
 *
 * Never import this entrypoint from browser applications.
 */
export {
  renderCanonicalCommercialProformaPdf,
  type CanonicalCommercialProforma,
} from './generator/canonicalCommercialProformaPdf';
export {
  renderClientOutputPdf,
  type ClientOutputAssetLoader,
} from './generator/clientOutputPdf';
