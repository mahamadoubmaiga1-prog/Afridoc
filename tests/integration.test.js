'use strict';

const http = require('http');
const assert = require('assert');
const app = require('../server');

let server;
let port;

before(function (done) {
  global.docStats.total = 0;
  server = http.createServer(app);
  server.listen(0, function () {
    port = server.address().port;
    done();
  });
});

after(function (done) {
  server.close(done);
});

function request(options, body, callback) {
  const req = http.request(options, function (res) {
    const chunks = [];
    res.on('data', function (d) { chunks.push(d); });
    res.on('end', function () {
      callback(null, res, Buffer.concat(chunks));
    });
  });
  req.on('error', callback);
  if (body) req.write(body);
  req.end();
}

describe('Afridoc Integration Tests', function () {
  this.timeout(10000);

  it('GET / returns 200', function (done) {
    request({ hostname: 'localhost', port, path: '/', method: 'GET' }, null, function (err, res) {
      assert.ifError(err);
      assert.strictEqual(res.statusCode, 200);
      done();
    });
  });

  const docTypes = ['cv', 'lettre-motivation', 'demande-emploi', 'demande-stage',
    'attestation-travail', 'declaration-honneur', 'lettre-administrative', 'demande-acte-naissance',
    'contrat-travail', 'recu-paiement', 'procuration', 'demande-conge',
    'certificat-residence', 'lettre-recommandation', 'mise-en-demeure', 'attestation-scolarite'];

  docTypes.forEach(function (type) {
    it('GET /documents/' + type + ' returns 200', function (done) {
      request({ hostname: 'localhost', port, path: '/documents/' + type, method: 'GET' }, null, function (err, res) {
        assert.ifError(err);
        assert.strictEqual(res.statusCode, 200);
        done();
      });
    });
  });

  it('POST /documents/cv/generate returns PDF', function (done) {
    const body = 'prenom=Test&nom=User&titre=Dev&formation=BAC&theme=classique';
    const opts = {
      hostname: 'localhost', port,
      path: '/documents/cv/generate',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
    };
    request(opts, body, function (err, res) {
      assert.ifError(err);
      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.headers['content-type'].includes('application/pdf'));
      done();
    });
  });

  it('POST /documents/lettre-motivation/generate returns PDF', function (done) {
    const body = 'prenom=Test&nom=User&adresse=Bamako&ville=Bamako&date=14+juin+2024&destinataire=RH&poste=Dev&entreprise=Afridoc&corps=Bonjour&theme=moderne';
    const opts = {
      hostname: 'localhost', port,
      path: '/documents/lettre-motivation/generate',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
    };
    request(opts, body, function (err, res) {
      assert.ifError(err);
      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.headers['content-type'].includes('application/pdf'));
      done();
    });
  });

  it('POST /documents/contrat-travail/generate returns PDF', function (done) {
    const body = 'employeur=Afridoc&adresseEmployeur=Bamako&representant=Awa&titreRepresentant=DG&prenomEmp=Moussa&nomEmp=Diallo&adresseEmp=Sikasso&dateNaissance=12+mai+1998&nationalite=Malienne&poste=Agent&typeContrat=CDI&dateDebut=1er+juillet+2024&salaire=250000&lieuTravail=Bamako&ville=Bamako&date=14+juin+2024&theme=minimaliste';
    const opts = {
      hostname: 'localhost', port,
      path: '/documents/contrat-travail/generate',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
    };
    request(opts, body, function (err, res) {
      assert.ifError(err);
      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.headers['content-type'].includes('application/pdf'));
      done();
    });
  });

  it('POST /documents/contrat-travail/preview renders HTML preview', function (done) {
    const body = 'employeur=Afridoc&adresseEmployeur=Bamako&representant=Awa&titreRepresentant=DG&prenomEmp=Moussa&nomEmp=Diallo&adresseEmp=Sikasso&dateNaissance=12+mai+1998&nationalite=Malienne&poste=Agent&typeContrat=CDI&dateDebut=1er+juillet+2024&salaire=250000&lieuTravail=Bamako&ville=Bamako&date=14+juin+2024&theme=classique';
    const opts = {
      hostname: 'localhost', port,
      path: '/documents/contrat-travail/preview',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
    };
    request(opts, body, function (err, res, responseBody) {
      assert.ifError(err);
      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.headers['content-type'].includes('text/html'));
      assert.ok(responseBody.toString().includes('Aperçu'));
      done();
    });
  });

  it('GET /api/stats returns JSON', function (done) {
    request({ hostname: 'localhost', port, path: '/api/stats', method: 'GET' }, null, function (err, res, body) {
      assert.ifError(err);
      assert.strictEqual(res.statusCode, 200);
      const json = JSON.parse(body.toString());
      assert.ok(typeof json.total === 'number');
      assert.ok(json.total >= 3);
      done();
    });
  });

  it('GET /manifest.json returns manifest', function (done) {
    request({ hostname: 'localhost', port, path: '/manifest.json', method: 'GET' }, null, function (err, res, body) {
      assert.ifError(err);
      assert.strictEqual(res.statusCode, 200);
      const manifest = JSON.parse(body.toString());
      assert.strictEqual(manifest.name, 'Afridoc');
      done();
    });
  });

  it('GET /api/health returns ok', function (done) {
    request({ hostname: 'localhost', port, path: '/api/health', method: 'GET' }, null, function (err, res, body) {
      assert.ifError(err);
      assert.strictEqual(res.statusCode, 200);
      const json = JSON.parse(body.toString());
      assert.strictEqual(json.status, 'ok');
      assert.ok(typeof json.uptime === 'number');
      done();
    });
  });

  it('GET /this-page-does-not-exist returns 404', function (done) {
    request({ hostname: 'localhost', port, path: '/this-page-does-not-exist', method: 'GET' }, null, function (err, res) {
      assert.ifError(err);
      assert.strictEqual(res.statusCode, 404);
      done();
    });
  });
});
