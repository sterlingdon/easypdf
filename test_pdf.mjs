import { PDFDocument } from 'pdf-lib';

async function test() {
    const doc = await PDFDocument.create();
    console.log('Has encrypt?', typeof doc.encrypt);
    // console.log('Methods:', Object.keys(doc));
    // console.log('Proto Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(doc)));
}

test().catch(console.error);
