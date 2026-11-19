// Exposes the kit's moment loader to the React app. Loaded by a <script type="module"> tag (useMoment.js),
// because a bundler must not import files from /public. window.__momentsManual is set first, so the loader
// waits for the app to hand it each section instead of scanning the page once.
import moments from './moments.js';

window.__moments = moments;
