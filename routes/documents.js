'use strict';

const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');

// ── helpers ────────────────────────────────────────────────────────────────

// Strip characters that have no place in plain PDF text content.
function sanitize(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim().slice(0, 500);
}

function startPDF(res, filename) {
  const doc = new PDFDocument({ margin: 48, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);
  return doc;
}

function pdfHeader(doc, title) {
  // Professional header with gradient effect (simulated with multiple elements)
  const pageWidth = doc.page.width;
  
  // Main header background - darker green
  doc
    .rect(0, 0, pageWidth, 100)
    .fill('#1B5E20');
  
  // Accent bar
  doc
    .rect(0, 95, pageWidth, 5)
    .fill('#FFD700');
  
  // Brand text - centered and prominent
  doc
    .fillColor('#FFD700')
    .fontSize(28)
    .font('Helvetica-Bold')
    .text('AFRIDOC', 48, 18, { align: 'center' });
  
  // Tagline
  doc
    .fillColor('#FFFFFF')
    .fontSize(11)
    .font('Helvetica')
    .text('Génération Professionnelle de Documents Administratifs', 48, 52, { align: 'center' });
  
  // Document title
  doc.moveDown(2.5);
  doc
    .fillColor('#1B5E20')
    .fontSize(16)
    .font('Helvetica-Bold')
    .text(title, { align: 'center' });
  
  // Separator line
  doc
    .moveTo(48, doc.y + 8)
    .lineTo(pageWidth - 48, doc.y + 8)
    .strokeColor('#FFD700')
    .lineWidth(2)
    .stroke();
  
  doc.moveDown(1.5);
  doc.fillColor('#333333').font('Helvetica').fontSize(10);
}

function pdfFooter(doc) {
  const bottom = doc.page.height - 50;
  
  // Separator line
  doc
    .moveTo(48, bottom)
    .lineTo(doc.page.width - 48, bottom)
    .strokeColor('#FFD700')
    .lineWidth(1)
    .stroke();
  
  // Footer text
  doc
    .fillColor('#666666')
    .fontSize(9)
    .font('Helvetica')
    .text('Généré par Afridoc — Document Administratif Professionnel', 48, bottom + 10, {
      align: 'center',
    });
  
  // Date generated
  doc
    .fillColor('#999999')
    .fontSize(8)
    .text(`Generated on ${new Date().toLocaleDateString('fr-FR')}`, 48, bottom + 22, {
      align: 'center',
    });
}

function field(doc, label, value) {
  doc
    .fillColor('#1B5E20')
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(`${label}: `, { continued: true });
  
  doc
    .fillColor('#333333')
    .font('Helvetica')
    .text(value || '_____________________________');
}

function sectionTitle(doc, title) {
  doc.moveDown(0.8);
  
  // Background color for section title
  doc
    .rect(48, doc.y, doc.page.width - 96, 22)
    .fill('#F5F5F5');
  
  // Title text
  doc
    .fillColor('#1B5E20')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(title.toUpperCase(), 50, doc.y + 5, { width: doc.page.width - 100 });
  
  doc.moveDown(1.2);
  doc.fillColor('#333333').font('Helvetica').fontSize(10);
}

// ── GET routes (forms) ────────────────────────────────────────────────────

const docTypes = [
  'cv',
  'lettre-motivation',
  'demande-emploi',
  'demande-stage',
  'attestation-travail',
  'declaration-honneur',
  'lettre-administrative',
  'demande-acte-naissance',
];

docTypes.forEach((type) => {
  router.get(`/${type}`, (req, res) => {
    res.render(`documents/${type}`);
  });
});

// ── POST routes (PDF generation) ──────────────────────────────────────────

// 1. CV
router.post('/cv/generate', (req, res) => {
  const d = {
    prenom: sanitize(req.body.prenom),
    nom: sanitize(req.body.nom),
    titre: sanitize(req.body.titre),
    email: sanitize(req.body.email),
    telephone: sanitize(req.body.telephone),
    adresse: sanitize(req.body.adresse),
    nationalite: sanitize(req.body.nationalite),
    dateNaissance: sanitize(req.body.dateNaissance),
    profil: sanitize(req.body.profil),
    formation: sanitize(req.body.formation),
    experience: sanitize(req.body.experience),
    competences: sanitize(req.body.competences),
    langues: sanitize(req.body.langues),
    references: sanitize(req.body.references),
  };

  const doc = startPDF(res, `cv_${d.nom}_${d.prenom}.pdf`);
  pdfHeader(doc, 'CURRICULUM VITAE');

  // Identity block
  sectionTitle(doc, 'Informations Personnelles');
  field(doc, 'Nom complet', `${d.prenom} ${d.nom}`);
  field(doc, 'Titre / Poste visé', d.titre);
  field(doc, 'Date de naissance', d.dateNaissance);
  field(doc, 'Nationalité', d.nationalite);
  field(doc, 'Adresse', d.adresse);
  field(doc, 'Téléphone', d.telephone);
  field(doc, 'Email', d.email);

  if (d.profil) {
    sectionTitle(doc, 'Profil');
    doc.text(d.profil, { align: 'justify' });
  }

  if (d.formation) {
    sectionTitle(doc, 'Formation');
    doc.text(d.formation, { align: 'justify' });
  }

  if (d.experience) {
    sectionTitle(doc, 'Expérience Professionnelle');
    doc.text(d.experience, { align: 'justify' });
  }

  if (d.competences) {
    sectionTitle(doc, 'Compétences');
    doc.text(d.competences, { align: 'justify' });
  }

  if (d.langues) {
    sectionTitle(doc, 'Langues');
    doc.text(d.langues);
  }

  if (d.references) {
    sectionTitle(doc, 'Références');
    doc.text(d.references);
  }

  pdfFooter(doc);
  doc.end();
});

// 2. Lettre de motivation
router.post('/lettre-motivation/generate', (req, res) => {
  const d = {
    prenom: sanitize(req.body.prenom),
    nom: sanitize(req.body.nom),
    adresse: sanitize(req.body.adresse),
    telephone: sanitize(req.body.telephone),
    email: sanitize(req.body.email),
    ville: sanitize(req.body.ville),
    date: sanitize(req.body.date),
    destinataire: sanitize(req.body.destinataire),
    poste: sanitize(req.body.poste),
    entreprise: sanitize(req.body.entreprise),
    corps: sanitize(req.body.corps),
  };

  const doc = startPDF(res, `lettre_motivation_${d.nom}.pdf`);
  pdfHeader(doc, 'LETTRE DE MOTIVATION');

  // Sender info
  doc.fontSize(11).font('Helvetica');
  doc.text(`${d.prenom} ${d.nom}`);
  doc.text(d.adresse);
  doc.text(d.telephone);
  doc.text(d.email);
  doc.moveDown(0.5);
  doc.text(`${d.ville}, le ${d.date}`, { align: 'right' });
  doc.moveDown(0.5);
  doc.text(d.destinataire);
  doc.text(d.entreprise);
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').text(`Objet : Candidature au poste de ${d.poste}`);
  doc.moveDown(0.5);
  doc.font('Helvetica').text('Madame, Monsieur,');
  doc.moveDown(0.4);
  doc.text(d.corps, { align: 'justify' });
  doc.moveDown(1);
  doc.text('Dans l\'attente de votre réponse, veuillez agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.', { align: 'justify' });
  doc.moveDown(1.5);
  doc.text(`${d.prenom} ${d.nom}`, { align: 'right' });

  pdfFooter(doc);
  doc.end();
});

// 3. Demande d'emploi
router.post('/demande-emploi/generate', (req, res) => {
  const d = {
    prenom: sanitize(req.body.prenom),
    nom: sanitize(req.body.nom),
    adresse: sanitize(req.body.adresse),
    telephone: sanitize(req.body.telephone),
    email: sanitize(req.body.email),
    ville: sanitize(req.body.ville),
    date: sanitize(req.body.date),
    poste: sanitize(req.body.poste),
    entreprise: sanitize(req.body.entreprise),
    directeur: sanitize(req.body.directeur),
    diplome: sanitize(req.body.diplome),
    experience: sanitize(req.body.experience),
    motivation: sanitize(req.body.motivation),
  };

  const doc = startPDF(res, `demande_emploi_${d.nom}.pdf`);
  pdfHeader(doc, 'DEMANDE D\'EMPLOI');

  doc.fontSize(11).font('Helvetica');
  doc.text(`${d.prenom} ${d.nom}`);
  doc.text(d.adresse);
  doc.text(`Tél : ${d.telephone}`);
  doc.text(`Email : ${d.email}`);
  doc.moveDown(0.5);
  doc.text(`${d.ville}, le ${d.date}`, { align: 'right' });
  doc.moveDown(0.5);
  doc.text(`À l'attention de ${d.directeur}`);
  doc.text(d.entreprise);
  doc.moveDown(0.5);
  doc
    .font('Helvetica-Bold')
    .text(`Objet : Demande d'emploi pour le poste de ${d.poste}`);
  doc.moveDown(0.5);
  doc.font('Helvetica').text('Madame, Monsieur,');
  doc.moveDown(0.4);
  doc.text(
    `J'ai l'honneur de solliciter auprès de votre direction un emploi au poste de ${d.poste}. ` +
    `Titulaire de ${d.diplome}, j'ai acquis une expérience de ${d.experience}.`,
    { align: 'justify' }
  );
  doc.moveDown(0.4);
  if (d.motivation) {
    doc.text(d.motivation, { align: 'justify' });
    doc.moveDown(0.4);
  }
  doc.text(
    'Dans l\'espoir que ma candidature retiendra votre bienveillante attention, je vous prie d\'agréer, ' +
    'Madame, Monsieur, l\'expression de mes respectueuses salutations.',
    { align: 'justify' }
  );
  doc.moveDown(1.5);
  doc.text(`${d.prenom} ${d.nom}`, { align: 'right' });

  pdfFooter(doc);
  doc.end();
});

// 4. Demande de stage
router.post('/demande-stage/generate', (req, res) => {
  const d = {
    prenom: sanitize(req.body.prenom),
    nom: sanitize(req.body.nom),
    adresse: sanitize(req.body.adresse),
    telephone: sanitize(req.body.telephone),
    email: sanitize(req.body.email),
    ville: sanitize(req.body.ville),
    date: sanitize(req.body.date),
    etablissement: sanitize(req.body.etablissement),
    niveau: sanitize(req.body.niveau),
    domaine: sanitize(req.body.domaine),
    entreprise: sanitize(req.body.entreprise),
    directeur: sanitize(req.body.directeur),
    duree: sanitize(req.body.duree),
    debut: sanitize(req.body.debut),
    motivation: sanitize(req.body.motivation),
  };

  const doc = startPDF(res, `demande_stage_${d.nom}.pdf`);
  pdfHeader(doc, 'DEMANDE DE STAGE');

  doc.fontSize(11).font('Helvetica');
  doc.text(`${d.prenom} ${d.nom}`);
  doc.text(d.adresse);
  doc.text(`Tél : ${d.telephone}`);
  doc.text(`Email : ${d.email}`);
  doc.moveDown(0.5);
  doc.text(`${d.ville}, le ${d.date}`, { align: 'right' });
  doc.moveDown(0.5);
  doc.text(`À l'attention de ${d.directeur}`);
  doc.text(d.entreprise);
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').text(`Objet : Demande de stage en ${d.domaine}`);
  doc.moveDown(0.5);
  doc.font('Helvetica').text('Madame, Monsieur,');
  doc.moveDown(0.4);
  doc.text(
    `Étudiant(e) en ${d.niveau} à ${d.etablissement}, j'ai l'honneur de vous soumettre ma candidature ` +
    `pour un stage d'une durée de ${d.duree}, à partir du ${d.debut}, au sein de votre structure.`,
    { align: 'justify' }
  );
  doc.moveDown(0.4);
  if (d.motivation) {
    doc.text(d.motivation, { align: 'justify' });
    doc.moveDown(0.4);
  }
  doc.text(
    'Disponible à tout entretien à votre convenance, je vous prie d\'agréer, Madame, Monsieur, ' +
    'l\'expression de mes respectueuses salutations.',
    { align: 'justify' }
  );
  doc.moveDown(1.5);
  doc.text(`${d.prenom} ${d.nom}`, { align: 'right' });

  pdfFooter(doc);
  doc.end();
});

// 5. Attestation de travail
router.post('/attestation-travail/generate', (req, res) => {
  const d = {
    directeur: sanitize(req.body.directeur),
    titre: sanitize(req.body.titre),
    entreprise: sanitize(req.body.entreprise),
    adresseEntreprise: sanitize(req.body.adresseEntreprise),
    prenomEmp: sanitize(req.body.prenomEmp),
    nomEmp: sanitize(req.body.nomEmp),
    posteEmp: sanitize(req.body.posteEmp),
    dateDebut: sanitize(req.body.dateDebut),
    salaire: sanitize(req.body.salaire),
    ville: sanitize(req.body.ville),
    date: sanitize(req.body.date),
  };

  const doc = startPDF(res, `attestation_travail_${d.nomEmp}.pdf`);
  pdfHeader(doc, 'ATTESTATION DE TRAVAIL');

  doc.fontSize(11).font('Helvetica');
  doc.text(d.entreprise, { align: 'center', bold: true });
  doc.text(d.adresseEntreprise, { align: 'center' });
  doc.moveDown(1);

  doc.font('Helvetica-Bold').fontSize(14).text('ATTESTATION DE TRAVAIL', { align: 'center' });
  doc.moveDown(1);

  doc.font('Helvetica').fontSize(11);
  doc.text(`Je soussigné(e), ${d.directeur}, ${d.titre} de la structure ${d.entreprise}, atteste que :`, { align: 'justify' });
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').text(`M. / Mme ${d.prenomEmp} ${d.nomEmp}`);
  doc.font('Helvetica');
  doc.text(`Est employé(e) au sein de notre structure en qualité de ${d.posteEmp}, depuis le ${d.dateDebut}.`);
  if (d.salaire) {
    doc.text(`Son salaire mensuel brut est de ${d.salaire} FCFA.`);
  }
  doc.moveDown(0.5);
  doc.text(
    'La présente attestation est délivrée à l\'intéressé(e) pour servir et valoir ce que de droit.',
    { align: 'justify' }
  );
  doc.moveDown(1.5);
  doc.text(`Fait à ${d.ville}, le ${d.date}`, { align: 'right' });
  doc.moveDown(1);
  doc.text(`${d.directeur}`, { align: 'right' });
  doc.text(`${d.titre}`, { align: 'right' });

  pdfFooter(doc);
  doc.end();
});

// 6. Déclaration sur l'honneur
router.post('/declaration-honneur/generate', (req, res) => {
  const d = {
    prenom: sanitize(req.body.prenom),
    nom: sanitize(req.body.nom),
    dateNaissance: sanitize(req.body.dateNaissance),
    lieuNaissance: sanitize(req.body.lieuNaissance),
    adresse: sanitize(req.body.adresse),
    profession: sanitize(req.body.profession),
    objet: sanitize(req.body.objet),
    contenu: sanitize(req.body.contenu),
    ville: sanitize(req.body.ville),
    date: sanitize(req.body.date),
  };

  const doc = startPDF(res, `declaration_honneur_${d.nom}.pdf`);
  pdfHeader(doc, 'DÉCLARATION SUR L\'HONNEUR');

  doc.fontSize(11).font('Helvetica');
  doc.text('Je soussigné(e) :');
  doc.moveDown(0.4);
  field(doc, 'Nom et prénom', `${d.prenom} ${d.nom}`);
  field(doc, 'Né(e) le', `${d.dateNaissance} à ${d.lieuNaissance}`);
  field(doc, 'Demeurant à', d.adresse);
  field(doc, 'Profession', d.profession);
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').text(`Déclare sur l'honneur que : ${d.objet}`);
  doc.moveDown(0.4);
  if (d.contenu) {
    doc.font('Helvetica').text(d.contenu, { align: 'justify' });
    doc.moveDown(0.4);
  }
  doc.font('Helvetica').text(
    'Je reconnais être informé(e) que toute fausse déclaration m\'expose à des poursuites judiciaires.',
    { align: 'justify' }
  );
  doc.moveDown(1.5);
  doc.text(`Fait à ${d.ville}, le ${d.date}`);
  doc.moveDown(2);
  doc.text('Signature :', { align: 'right' });
  doc.moveDown(2);
  doc.text(`${d.prenom} ${d.nom}`, { align: 'right' });

  pdfFooter(doc);
  doc.end();
});

// 7. Lettre administrative
router.post('/lettre-administrative/generate', (req, res) => {
  const d = {
    prenom: sanitize(req.body.prenom),
    nom: sanitize(req.body.nom),
    adresse: sanitize(req.body.adresse),
    telephone: sanitize(req.body.telephone),
    ville: sanitize(req.body.ville),
    date: sanitize(req.body.date),
    destinataire: sanitize(req.body.destinataire),
    service: sanitize(req.body.service),
    objet: sanitize(req.body.objet),
    corps: sanitize(req.body.corps),
  };

  const doc = startPDF(res, `lettre_administrative_${d.nom}.pdf`);
  pdfHeader(doc, 'LETTRE ADMINISTRATIVE');

  doc.fontSize(11).font('Helvetica');
  doc.text(`${d.prenom} ${d.nom}`);
  doc.text(d.adresse);
  doc.text(`Tél : ${d.telephone}`);
  doc.moveDown(0.5);
  doc.text(`${d.ville}, le ${d.date}`, { align: 'right' });
  doc.moveDown(0.5);
  doc.text(`À l'attention de : ${d.destinataire}`);
  if (d.service) doc.text(d.service);
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').text(`Objet : ${d.objet}`);
  doc.moveDown(0.5);
  doc.font('Helvetica').text('Monsieur / Madame,');
  doc.moveDown(0.4);
  doc.text(d.corps, { align: 'justify' });
  doc.moveDown(1);
  doc.text(
    'Dans l\'attente de votre réponse, veuillez agréer, Monsieur/Madame, l\'expression de mes respectueuses salutations.',
    { align: 'justify' }
  );
  doc.moveDown(1.5);
  doc.text(`${d.prenom} ${d.nom}`, { align: 'right' });

  pdfFooter(doc);
  doc.end();
});

// 8. Demande d'acte de naissance
router.post('/demande-acte-naissance/generate', (req, res) => {
  const d = {
    prenom: sanitize(req.body.prenom),
    nom: sanitize(req.body.nom),
    adresse: sanitize(req.body.adresse),
    telephone: sanitize(req.body.telephone),
    dateNaissance: sanitize(req.body.dateNaissance),
    lieuNaissance: sanitize(req.body.lieuNaissance),
    prenomPere: sanitize(req.body.prenomPere),
    nomPere: sanitize(req.body.nomPere),
    prenomMere: sanitize(req.body.prenomMere),
    nomMere: sanitize(req.body.nomMere),
    nombreCopies: sanitize(req.body.nombreCopies),
    usage: sanitize(req.body.usage),
    ville: sanitize(req.body.ville),
    date: sanitize(req.body.date),
  };

  const doc = startPDF(res, `demande_acte_naissance_${d.nom}.pdf`);
  pdfHeader(doc, 'DEMANDE D\'ACTE DE NAISSANCE');

  doc.fontSize(11).font('Helvetica');
  doc.text(`${d.prenom} ${d.nom}`);
  doc.text(d.adresse);
  doc.text(`Tél : ${d.telephone}`);
  doc.moveDown(0.5);
  doc.text(`${d.ville}, le ${d.date}`, { align: 'right' });
  doc.moveDown(0.5);
  doc.text('À Monsieur l\'Officier de l\'État Civil');
  doc.text(`Mairie de ${d.lieuNaissance}`);
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').text('Objet : Demande d\'acte de naissance');
  doc.moveDown(0.5);
  doc.font('Helvetica').text('Monsieur l\'Officier de l\'État Civil,');
  doc.moveDown(0.4);
  doc.text(
    `J'ai l'honneur de vous solliciter la délivrance de ${d.nombreCopies} copie(s) de mon acte de naissance aux fins suivantes : ${d.usage}.`,
    { align: 'justify' }
  );
  doc.moveDown(0.5);
  sectionTitle(doc, 'Informations sur l\'intéressé(e)');
  field(doc, 'Nom et prénom', `${d.prenom} ${d.nom}`);
  field(doc, 'Date de naissance', d.dateNaissance);
  field(doc, 'Lieu de naissance', d.lieuNaissance);
  field(doc, 'Nom du père', `${d.prenomPere} ${d.nomPere}`);
  field(doc, 'Nom de la mère', `${d.prenomMere} ${d.nomMere}`);
  doc.moveDown(0.5);
  doc.text(
    'Dans l\'attente d\'une suite favorable, veuillez agréer, Monsieur l\'Officier de l\'État Civil, l\'expression de mes respectueuses salutations.',
    { align: 'justify' }
  );
  doc.moveDown(1.5);
  doc.text(`${d.prenom} ${d.nom}`, { align: 'right' });

  pdfFooter(doc);
  doc.end();
});

module.exports = router;
