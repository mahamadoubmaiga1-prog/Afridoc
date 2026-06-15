'use strict';

const express = require('express');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

const router = express.Router();

const docDefinitions = {
  'cv': {
    title: 'Curriculum Vitae (CV)',
    filename: (d) => `cv_${safeFilename(d.nom)}_${safeFilename(d.prenom)}.pdf`,
    fieldKeys: ['prenom', 'nom', 'titre', 'email', 'telephone', 'adresse', 'nationalite', 'dateNaissance', 'profil', 'formation', 'experience', 'competences', 'langues', 'references'],
    previewGroups: [
      { title: 'Informations personnelles', fields: [['prenom', 'Prénom'], ['nom', 'Nom'], ['titre', 'Titre / Poste visé'], ['dateNaissance', 'Date de naissance'], ['nationalite', 'Nationalité'], ['adresse', 'Adresse'], ['telephone', 'Téléphone'], ['email', 'Email']] },
      { title: 'Contenu', fields: [['profil', 'Profil'], ['formation', 'Formation'], ['experience', 'Expérience'], ['competences', 'Compétences'], ['langues', 'Langues'], ['references', 'Références']] },
    ],
    render(doc, d, theme) {
      pdfHeader(doc, 'CURRICULUM VITAE', theme);
      sectionTitle(doc, 'Informations Personnelles', theme);
      field(doc, 'Nom complet', `${d.prenom} ${d.nom}`.trim(), theme);
      field(doc, 'Titre / Poste visé', d.titre, theme);
      field(doc, 'Date de naissance', d.dateNaissance, theme);
      field(doc, 'Nationalité', d.nationalite, theme);
      field(doc, 'Adresse', d.adresse, theme);
      field(doc, 'Téléphone', d.telephone, theme);
      field(doc, 'Email', d.email, theme);
      if (d.profil) { sectionTitle(doc, 'Profil', theme); bodyText(doc, d.profil); }
      if (d.formation) { sectionTitle(doc, 'Formation', theme); bodyText(doc, d.formation); }
      if (d.experience) { sectionTitle(doc, 'Expérience Professionnelle', theme); bodyText(doc, d.experience); }
      if (d.competences) { sectionTitle(doc, 'Compétences', theme); bodyText(doc, d.competences); }
      if (d.langues) { sectionTitle(doc, 'Langues', theme); bodyText(doc, d.langues); }
      if (d.references) { sectionTitle(doc, 'Références', theme); bodyText(doc, d.references); }
    },
  },
  'lettre-motivation': {
    title: 'Lettre de motivation',
    filename: (d) => `lettre_motivation_${safeFilename(d.nom)}.pdf`,
    fieldKeys: ['prenom', 'nom', 'adresse', 'telephone', 'email', 'ville', 'date', 'destinataire', 'poste', 'entreprise', 'corps'],
    previewGroups: [
      { title: 'Expéditeur', fields: [['prenom', 'Prénom'], ['nom', 'Nom'], ['adresse', 'Adresse'], ['telephone', 'Téléphone'], ['email', 'Email'], ['ville', 'Ville'], ['date', 'Date']] },
      { title: 'Destinataire', fields: [['destinataire', 'Destinataire'], ['entreprise', 'Entreprise'], ['poste', 'Poste visé'], ['corps', 'Corps de la lettre']] },
    ],
    render(doc, d, theme) {
      pdfHeader(doc, 'LETTRE DE MOTIVATION', theme);
      doc.fontSize(11).font('Helvetica').fillColor(theme.textColor);
      doc.text(`${d.prenom} ${d.nom}`.trim());
      doc.text(d.adresse);
      if (d.telephone) doc.text(d.telephone);
      if (d.email) doc.text(d.email);
      doc.moveDown(0.5);
      doc.text(`${d.ville}, le ${d.date}`, { align: 'right' });
      doc.moveDown(0.5);
      doc.text(d.destinataire);
      doc.text(d.entreprise);
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fillColor(theme.accentColor).text(`Objet : Candidature au poste de ${d.poste}`);
      doc.moveDown(0.5);
      doc.font('Helvetica').fillColor(theme.textColor).text('Madame, Monsieur,');
      doc.moveDown(0.4);
      bodyText(doc, d.corps);
      doc.moveDown(1);
      bodyText(doc, 'Dans l\'attente de votre réponse, veuillez agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.');
      doc.moveDown(1.5);
      doc.text(`${d.prenom} ${d.nom}`.trim(), { align: 'right' });
    },
  },
  'demande-emploi': {
    title: 'Demande d\'emploi',
    filename: (d) => `demande_emploi_${safeFilename(d.nom)}.pdf`,
    fieldKeys: ['prenom', 'nom', 'adresse', 'telephone', 'email', 'ville', 'date', 'poste', 'entreprise', 'directeur', 'diplome', 'experience', 'motivation'],
    previewGroups: [
      { title: 'Candidat', fields: [['prenom', 'Prénom'], ['nom', 'Nom'], ['adresse', 'Adresse'], ['telephone', 'Téléphone'], ['email', 'Email'], ['ville', 'Ville'], ['date', 'Date']] },
      { title: 'Candidature', fields: [['poste', 'Poste'], ['entreprise', 'Entreprise'], ['directeur', 'Responsable'], ['diplome', 'Diplôme'], ['experience', 'Expérience'], ['motivation', 'Motivation']] },
    ],
    render(doc, d, theme) {
      pdfHeader(doc, 'DEMANDE D\'EMPLOI', theme);
      doc.fontSize(11).font('Helvetica').fillColor(theme.textColor);
      doc.text(`${d.prenom} ${d.nom}`.trim());
      doc.text(d.adresse);
      doc.text(`Tél : ${d.telephone}`);
      doc.text(`Email : ${d.email}`);
      doc.moveDown(0.5);
      doc.text(`${d.ville}, le ${d.date}`, { align: 'right' });
      doc.moveDown(0.5);
      doc.text(`À l'attention de ${d.directeur}`);
      doc.text(d.entreprise);
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fillColor(theme.accentColor).text(`Objet : Demande d'emploi pour le poste de ${d.poste}`);
      doc.moveDown(0.5);
      doc.font('Helvetica').fillColor(theme.textColor).text('Madame, Monsieur,');
      doc.moveDown(0.4);
      bodyText(doc, `J'ai l'honneur de solliciter auprès de votre direction un emploi au poste de ${d.poste}. Titulaire de ${d.diplome}, j'ai acquis une expérience de ${d.experience}.`);
      if (d.motivation) { doc.moveDown(0.4); bodyText(doc, d.motivation); }
      doc.moveDown(0.4);
      bodyText(doc, 'Dans l\'espoir que ma candidature retiendra votre bienveillante attention, je vous prie d\'agréer, Madame, Monsieur, l\'expression de mes respectueuses salutations.');
      doc.moveDown(1.5);
      doc.text(`${d.prenom} ${d.nom}`.trim(), { align: 'right' });
    },
  },
  'demande-stage': {
    title: 'Demande de stage',
    filename: (d) => `demande_stage_${safeFilename(d.nom)}.pdf`,
    fieldKeys: ['prenom', 'nom', 'adresse', 'telephone', 'email', 'ville', 'date', 'etablissement', 'niveau', 'domaine', 'entreprise', 'directeur', 'duree', 'debut', 'motivation'],
    previewGroups: [
      { title: 'Étudiant', fields: [['prenom', 'Prénom'], ['nom', 'Nom'], ['adresse', 'Adresse'], ['telephone', 'Téléphone'], ['email', 'Email'], ['ville', 'Ville'], ['date', 'Date']] },
      { title: 'Stage', fields: [['etablissement', 'Établissement'], ['niveau', 'Niveau'], ['domaine', 'Domaine'], ['entreprise', 'Entreprise'], ['directeur', 'Responsable'], ['duree', 'Durée'], ['debut', 'Début'], ['motivation', 'Motivation']] },
    ],
    render(doc, d, theme) {
      pdfHeader(doc, 'DEMANDE DE STAGE', theme);
      doc.fontSize(11).font('Helvetica').fillColor(theme.textColor);
      doc.text(`${d.prenom} ${d.nom}`.trim());
      doc.text(d.adresse);
      doc.text(`Tél : ${d.telephone}`);
      doc.text(`Email : ${d.email}`);
      doc.moveDown(0.5);
      doc.text(`${d.ville}, le ${d.date}`, { align: 'right' });
      doc.moveDown(0.5);
      doc.text(`À l'attention de ${d.directeur}`);
      doc.text(d.entreprise);
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fillColor(theme.accentColor).text(`Objet : Demande de stage en ${d.domaine}`);
      doc.moveDown(0.5);
      doc.font('Helvetica').fillColor(theme.textColor).text('Madame, Monsieur,');
      doc.moveDown(0.4);
      bodyText(doc, `Étudiant(e) en ${d.niveau} à ${d.etablissement}, j'ai l'honneur de vous soumettre ma candidature pour un stage d'une durée de ${d.duree}, à partir du ${d.debut}, au sein de votre structure.`);
      if (d.motivation) { doc.moveDown(0.4); bodyText(doc, d.motivation); }
      doc.moveDown(0.4);
      bodyText(doc, 'Disponible à tout entretien à votre convenance, je vous prie d\'agréer, Madame, Monsieur, l\'expression de mes respectueuses salutations.');
      doc.moveDown(1.5);
      doc.text(`${d.prenom} ${d.nom}`.trim(), { align: 'right' });
    },
  },
  'attestation-travail': {
    title: 'Attestation de travail',
    filename: (d) => `attestation_travail_${safeFilename(d.nomEmp)}.pdf`,
    fieldKeys: ['directeur', 'titre', 'entreprise', 'adresseEntreprise', 'prenomEmp', 'nomEmp', 'posteEmp', 'dateDebut', 'salaire', 'ville', 'date'],
    previewGroups: [
      { title: 'Entreprise', fields: [['directeur', 'Responsable'], ['titre', 'Titre'], ['entreprise', 'Entreprise'], ['adresseEntreprise', 'Adresse']] },
      { title: 'Employé', fields: [['prenomEmp', 'Prénom'], ['nomEmp', 'Nom'], ['posteEmp', 'Poste'], ['dateDebut', 'Date de début'], ['salaire', 'Salaire'], ['ville', 'Ville'], ['date', 'Date']] },
    ],
    render(doc, d, theme) {
      pdfHeader(doc, 'ATTESTATION DE TRAVAIL', theme);
      doc.fontSize(11).font('Helvetica').fillColor(theme.textColor);
      doc.text(d.entreprise, { align: 'center' });
      doc.text(d.adresseEntreprise, { align: 'center' });
      doc.moveDown(1);
      doc.font('Helvetica-Bold').fontSize(14).fillColor(theme.accentColor).text('ATTESTATION DE TRAVAIL', { align: 'center' });
      doc.moveDown(1);
      doc.font('Helvetica').fontSize(11).fillColor(theme.textColor);
      bodyText(doc, `Je soussigné(e), ${d.directeur}, ${d.titre} de la structure ${d.entreprise}, atteste que :`);
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text(`M. / Mme ${d.prenomEmp} ${d.nomEmp}`.trim());
      doc.font('Helvetica');
      bodyText(doc, `Est employé(e) au sein de notre structure en qualité de ${d.posteEmp}, depuis le ${d.dateDebut}.`);
      if (d.salaire) bodyText(doc, `Son salaire mensuel brut est de ${d.salaire} FCFA.`);
      doc.moveDown(0.5);
      bodyText(doc, 'La présente attestation est délivrée à l\'intéressé(e) pour servir et valoir ce que de droit.');
      doc.moveDown(1.5);
      doc.text(`Fait à ${d.ville}, le ${d.date}`, { align: 'right' });
      doc.moveDown(1);
      doc.text(`${d.directeur}`, { align: 'right' });
      doc.text(`${d.titre}`, { align: 'right' });
    },
  },
  'declaration-honneur': {
    title: 'Déclaration sur l\'honneur',
    filename: (d) => `declaration_honneur_${safeFilename(d.nom)}.pdf`,
    fieldKeys: ['prenom', 'nom', 'dateNaissance', 'lieuNaissance', 'adresse', 'profession', 'objet', 'contenu', 'ville', 'date'],
    previewGroups: [
      { title: 'Déclarant', fields: [['prenom', 'Prénom'], ['nom', 'Nom'], ['dateNaissance', 'Date de naissance'], ['lieuNaissance', 'Lieu de naissance'], ['adresse', 'Adresse'], ['profession', 'Profession']] },
      { title: 'Déclaration', fields: [['objet', 'Objet'], ['contenu', 'Contenu'], ['ville', 'Ville'], ['date', 'Date']] },
    ],
    render(doc, d, theme) {
      pdfHeader(doc, 'DÉCLARATION SUR L\'HONNEUR', theme);
      doc.fontSize(11).font('Helvetica').fillColor(theme.textColor);
      doc.text('Je soussigné(e) :');
      doc.moveDown(0.4);
      field(doc, 'Nom et prénom', `${d.prenom} ${d.nom}`.trim(), theme);
      field(doc, 'Né(e) le', `${d.dateNaissance} à ${d.lieuNaissance}`.trim(), theme);
      field(doc, 'Demeurant à', d.adresse, theme);
      field(doc, 'Profession', d.profession, theme);
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fillColor(theme.accentColor).text(`Déclare sur l'honneur que : ${d.objet}`);
      if (d.contenu) { doc.moveDown(0.4); bodyText(doc, d.contenu); }
      doc.moveDown(0.4);
      bodyText(doc, 'Je reconnais être informé(e) que toute fausse déclaration m\'expose à des poursuites judiciaires.');
      doc.moveDown(1.5);
      doc.text(`Fait à ${d.ville}, le ${d.date}`);
      doc.moveDown(2);
      doc.text('Signature :', { align: 'right' });
      doc.moveDown(2);
      doc.text(`${d.prenom} ${d.nom}`.trim(), { align: 'right' });
    },
  },
  'lettre-administrative': {
    title: 'Lettre administrative',
    filename: (d) => `lettre_administrative_${safeFilename(d.nom)}.pdf`,
    fieldKeys: ['prenom', 'nom', 'adresse', 'telephone', 'ville', 'date', 'destinataire', 'service', 'objet', 'corps'],
    previewGroups: [
      { title: 'Expéditeur', fields: [['prenom', 'Prénom'], ['nom', 'Nom'], ['adresse', 'Adresse'], ['telephone', 'Téléphone'], ['ville', 'Ville'], ['date', 'Date']] },
      { title: 'Lettre', fields: [['destinataire', 'Destinataire'], ['service', 'Service'], ['objet', 'Objet'], ['corps', 'Corps']] },
    ],
    render(doc, d, theme) {
      pdfHeader(doc, 'LETTRE ADMINISTRATIVE', theme);
      doc.fontSize(11).font('Helvetica').fillColor(theme.textColor);
      doc.text(`${d.prenom} ${d.nom}`.trim());
      doc.text(d.adresse);
      doc.text(`Tél : ${d.telephone}`);
      doc.moveDown(0.5);
      doc.text(`${d.ville}, le ${d.date}`, { align: 'right' });
      doc.moveDown(0.5);
      doc.text(`À l'attention de : ${d.destinataire}`);
      if (d.service) doc.text(d.service);
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fillColor(theme.accentColor).text(`Objet : ${d.objet}`);
      doc.moveDown(0.5);
      doc.font('Helvetica').fillColor(theme.textColor).text('Monsieur / Madame,');
      doc.moveDown(0.4);
      bodyText(doc, d.corps);
      doc.moveDown(1);
      bodyText(doc, 'Dans l\'attente de votre réponse, veuillez agréer, Monsieur/Madame, l\'expression de mes respectueuses salutations.');
      doc.moveDown(1.5);
      doc.text(`${d.prenom} ${d.nom}`.trim(), { align: 'right' });
    },
  },
  'demande-acte-naissance': {
    title: 'Demande d\'acte de naissance',
    filename: (d) => `demande_acte_naissance_${safeFilename(d.nom)}.pdf`,
    fieldKeys: ['prenom', 'nom', 'adresse', 'telephone', 'dateNaissance', 'lieuNaissance', 'prenomPere', 'nomPere', 'prenomMere', 'nomMere', 'nombreCopies', 'usage', 'ville', 'date'],
    previewGroups: [
      { title: 'Demandeur', fields: [['prenom', 'Prénom'], ['nom', 'Nom'], ['adresse', 'Adresse'], ['telephone', 'Téléphone'], ['ville', 'Ville'], ['date', 'Date']] },
      { title: 'Naissance', fields: [['dateNaissance', 'Date de naissance'], ['lieuNaissance', 'Lieu de naissance'], ['prenomPere', 'Prénom du père'], ['nomPere', 'Nom du père'], ['prenomMere', 'Prénom de la mère'], ['nomMere', 'Nom de la mère'], ['nombreCopies', 'Nombre de copies'], ['usage', 'Usage']] },
    ],
    render(doc, d, theme) {
      pdfHeader(doc, 'DEMANDE D\'ACTE DE NAISSANCE', theme);
      doc.fontSize(11).font('Helvetica').fillColor(theme.textColor);
      doc.text(`${d.prenom} ${d.nom}`.trim());
      doc.text(d.adresse);
      doc.text(`Tél : ${d.telephone}`);
      doc.moveDown(0.5);
      doc.text(`${d.ville}, le ${d.date}`, { align: 'right' });
      doc.moveDown(0.5);
      doc.text('À Monsieur l\'Officier de l\'État Civil');
      doc.text(`Mairie de ${d.lieuNaissance}`);
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fillColor(theme.accentColor).text('Objet : Demande d\'acte de naissance');
      doc.moveDown(0.5);
      doc.font('Helvetica').fillColor(theme.textColor).text('Monsieur l\'Officier de l\'État Civil,');
      doc.moveDown(0.4);
      bodyText(doc, `J'ai l'honneur de vous solliciter la délivrance de ${d.nombreCopies} copie(s) de mon acte de naissance aux fins suivantes : ${d.usage}.`);
      doc.moveDown(0.5);
      sectionTitle(doc, 'Informations sur l\'intéressé(e)', theme);
      field(doc, 'Nom et prénom', `${d.prenom} ${d.nom}`.trim(), theme);
      field(doc, 'Date de naissance', d.dateNaissance, theme);
      field(doc, 'Lieu de naissance', d.lieuNaissance, theme);
      field(doc, 'Nom du père', `${d.prenomPere} ${d.nomPere}`.trim(), theme);
      field(doc, 'Nom de la mère', `${d.prenomMere} ${d.nomMere}`.trim(), theme);
      doc.moveDown(0.5);
      bodyText(doc, 'Dans l\'attente d\'une suite favorable, veuillez agréer, Monsieur l\'Officier de l\'État Civil, l\'expression de mes respectueuses salutations.');
      doc.moveDown(1.5);
      doc.text(`${d.prenom} ${d.nom}`.trim(), { align: 'right' });
    },
  },
  'contrat-travail': {
    title: 'Contrat de travail',
    filename: (d) => `contrat_travail_${safeFilename(d.nomEmp)}.pdf`,
    fieldKeys: ['employeur', 'adresseEmployeur', 'representant', 'titreRepresentant', 'prenomEmp', 'nomEmp', 'adresseEmp', 'dateNaissance', 'nationalite', 'poste', 'typeContrat', 'duree', 'dateDebut', 'salaire', 'periodeEssai', 'lieuTravail', 'ville', 'date'],
    previewGroups: [
      { title: 'Employeur', fields: [['employeur', 'Entreprise'], ['adresseEmployeur', 'Adresse'], ['representant', 'Représentant'], ['titreRepresentant', 'Titre']] },
      { title: 'Salarié', fields: [['prenomEmp', 'Prénom'], ['nomEmp', 'Nom'], ['adresseEmp', 'Adresse'], ['dateNaissance', 'Date de naissance'], ['nationalite', 'Nationalité']] },
      { title: 'Contrat', fields: [['poste', 'Poste'], ['typeContrat', 'Type de contrat'], ['duree', 'Durée'], ['dateDebut', 'Date de début'], ['salaire', 'Salaire'], ['periodeEssai', 'Période d\'essai'], ['lieuTravail', 'Lieu de travail'], ['ville', 'Ville'], ['date', 'Date']] },
    ],
    render(doc, d, theme) {
      pdfHeader(doc, 'CONTRAT DE TRAVAIL', theme);
      sectionTitle(doc, 'Parties au contrat', theme);
      bodyText(doc, `Entre la société ${d.employeur}, située à ${d.adresseEmployeur}, représentée par ${d.representant}, ${d.titreRepresentant}, ci-après dénommée « l'Employeur »,`);
      doc.moveDown(0.4);
      bodyText(doc, `Et ${d.prenomEmp} ${d.nomEmp}, né(e) le ${d.dateNaissance}, de nationalité ${d.nationalite}, demeurant à ${d.adresseEmp}, ci-après dénommé(e) « le Salarié »,`);
      sectionTitle(doc, 'Conditions d\'emploi', theme);
      field(doc, 'Poste', d.poste, theme);
      field(doc, 'Type de contrat', d.typeContrat, theme);
      if (d.typeContrat === 'CDD') field(doc, 'Durée', d.duree, theme);
      field(doc, 'Date de début', d.dateDebut, theme);
      field(doc, 'Lieu de travail', d.lieuTravail, theme);
      field(doc, 'Salaire mensuel', `${d.salaire} FCFA`, theme);
      if (d.periodeEssai) field(doc, 'Période d\'essai', d.periodeEssai, theme);
      sectionTitle(doc, 'Clauses', theme);
      bodyText(doc, 'Le salarié s\'engage à exercer ses fonctions avec professionnalisme, diligence et respect des règles internes de la structure.');
      bodyText(doc, 'L\'employeur s\'engage à verser la rémunération convenue et à fournir au salarié les moyens nécessaires à l\'exécution de sa mission.');
      bodyText(doc, 'Le présent contrat prend effet à compter de la date mentionnée ci-dessus et est établi en deux exemplaires originaux.');
      doc.moveDown(1.5);
      doc.text(`Fait à ${d.ville}, le ${d.date}`);
      doc.moveDown(2);
      doc.text('Pour l\'Employeur', 48, doc.y, { continued: true });
      doc.text('Pour le Salarié', { align: 'right' });
    },
  },
  'recu-paiement': {
    title: 'Reçu de paiement',
    filename: (d) => `recu_paiement_${safeFilename(d.numeroRecu)}.pdf`,
    fieldKeys: ['prenomPayeur', 'nomPayeur', 'adressePayeur', 'prenomBeneficiaire', 'nomBeneficiaire', 'montant', 'monnaie', 'motif', 'modePaiement', 'numeroRecu', 'ville', 'date'],
    previewGroups: [
      { title: 'Payeur', fields: [['prenomPayeur', 'Prénom'], ['nomPayeur', 'Nom'], ['adressePayeur', 'Adresse']] },
      { title: 'Paiement', fields: [['prenomBeneficiaire', 'Prénom du bénéficiaire'], ['nomBeneficiaire', 'Nom du bénéficiaire'], ['montant', 'Montant'], ['monnaie', 'Monnaie'], ['motif', 'Motif'], ['modePaiement', 'Mode de paiement'], ['numeroRecu', 'Numéro de reçu'], ['ville', 'Ville'], ['date', 'Date']] },
    ],
    render(doc, d, theme) {
      pdfHeader(doc, 'REÇU DE PAIEMENT', theme);
      sectionTitle(doc, 'Référence', theme);
      field(doc, 'Numéro de reçu', d.numeroRecu, theme);
      field(doc, 'Date', `${d.ville}, le ${d.date}`, theme);
      sectionTitle(doc, 'Parties', theme);
      field(doc, 'Payeur', `${d.prenomPayeur} ${d.nomPayeur}`.trim(), theme);
      field(doc, 'Adresse du payeur', d.adressePayeur, theme);
      field(doc, 'Bénéficiaire', `${d.prenomBeneficiaire} ${d.nomBeneficiaire}`.trim(), theme);
      sectionTitle(doc, 'Détails du paiement', theme);
      field(doc, 'Montant', `${d.montant} ${d.monnaie}`, theme);
      field(doc, 'Mode de paiement', d.modePaiement, theme);
      field(doc, 'Motif', d.motif, theme);
      doc.moveDown(0.8);
      bodyText(doc, `Je soussigné(e), ${d.prenomBeneficiaire} ${d.nomBeneficiaire}, reconnais avoir reçu de ${d.prenomPayeur} ${d.nomPayeur} la somme de ${d.montant} ${d.monnaie} au titre de : ${d.motif}.`);
      doc.moveDown(1.5);
      doc.text('Signature du bénéficiaire', { align: 'right' });
    },
  },
  'procuration': {
    title: 'Procuration',
    filename: (d) => `procuration_${safeFilename(d.nomMandant)}.pdf`,
    fieldKeys: ['prenomMandant', 'nomMandant', 'dateNaissanceMandant', 'lieuNaissanceMandant', 'adresseMandant', 'prenomMandataire', 'nomMandataire', 'dateNaissanceMandataire', 'adresseMandataire', 'objet', 'dureeValidite', 'ville', 'date'],
    previewGroups: [
      { title: 'Mandant', fields: [['prenomMandant', 'Prénom'], ['nomMandant', 'Nom'], ['dateNaissanceMandant', 'Date de naissance'], ['lieuNaissanceMandant', 'Lieu de naissance'], ['adresseMandant', 'Adresse']] },
      { title: 'Mandataire', fields: [['prenomMandataire', 'Prénom'], ['nomMandataire', 'Nom'], ['dateNaissanceMandataire', 'Date de naissance'], ['adresseMandataire', 'Adresse']] },
      { title: 'Objet', fields: [['objet', 'Objet'], ['dureeValidite', 'Durée de validité'], ['ville', 'Ville'], ['date', 'Date']] },
    ],
    render(doc, d, theme) {
      pdfHeader(doc, 'PROCURATION', theme);
      bodyText(doc, `Je soussigné(e), ${d.prenomMandant} ${d.nomMandant}, né(e) le ${d.dateNaissanceMandant} à ${d.lieuNaissanceMandant}, demeurant à ${d.adresseMandant}, donne par la présente procuration à ${d.prenomMandataire} ${d.nomMandataire}, né(e) le ${d.dateNaissanceMandataire}, demeurant à ${d.adresseMandataire}, pouvoir de me représenter pour :`);
      doc.moveDown(0.5);
      sectionTitle(doc, 'Objet de la procuration', theme);
      bodyText(doc, d.objet);
      doc.moveDown(0.5);
      field(doc, 'Durée de validité', d.dureeValidite, theme);
      bodyText(doc, 'Le mandataire pourra accomplir toutes les démarches utiles dans la limite de ce mandat pendant la période indiquée.');
      doc.moveDown(1.5);
      doc.text(`Fait à ${d.ville}, le ${d.date}`);
      doc.moveDown(2);
      doc.text('Signature du mandant', 48, doc.y, { continued: true });
      doc.text('Signature du mandataire', { align: 'right' });
    },
  },
  'demande-conge': {
    title: 'Demande de congé',
    filename: (d) => `demande_conge_${safeFilename(d.nom)}.pdf`,
    fieldKeys: ['prenom', 'nom', 'poste', 'service', 'entreprise', 'typeConge', 'dateDebut', 'dateFin', 'nombreJours', 'motif', 'directeur', 'ville', 'date'],
    previewGroups: [
      { title: 'Demandeur', fields: [['prenom', 'Prénom'], ['nom', 'Nom'], ['poste', 'Poste'], ['service', 'Service'], ['entreprise', 'Entreprise']] },
      { title: 'Congé', fields: [['typeConge', 'Type de congé'], ['dateDebut', 'Date de début'], ['dateFin', 'Date de fin'], ['nombreJours', 'Nombre de jours'], ['motif', 'Motif'], ['directeur', 'Responsable'], ['ville', 'Ville'], ['date', 'Date']] },
    ],
    render(doc, d, theme) {
      pdfHeader(doc, 'DEMANDE DE CONGÉ', theme);
      doc.fontSize(11).font('Helvetica').fillColor(theme.textColor);
      doc.text(`${d.prenom} ${d.nom}`.trim());
      doc.text(`${d.poste} — ${d.service}`);
      doc.text(d.entreprise);
      doc.moveDown(0.5);
      doc.text(`${d.ville}, le ${d.date}`, { align: 'right' });
      doc.moveDown(0.5);
      doc.text(`À l'attention de ${d.directeur}`);
      doc.text(d.entreprise);
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fillColor(theme.accentColor).text(`Objet : Demande de congé ${d.typeConge}`);
      doc.moveDown(0.5);
      doc.font('Helvetica').fillColor(theme.textColor).text('Madame, Monsieur,');
      doc.moveDown(0.4);
      bodyText(doc, `Par la présente, je sollicite l'autorisation de bénéficier d'un congé de type ${d.typeConge} du ${d.dateDebut} au ${d.dateFin}, soit ${d.nombreJours} jour(s).`);
      bodyText(doc, `Motif : ${d.motif}`);
      doc.moveDown(0.6);
      bodyText(doc, 'Je vous remercie par avance de l\'attention portée à ma demande et reste disponible pour toute précision complémentaire.');
      doc.moveDown(1.5);
      doc.text(`${d.prenom} ${d.nom}`.trim(), { align: 'right' });
    },
  },
  'certificat-residence': {
    title: 'Certificat de résidence',
    filename: (d) => `certificat_residence_${safeFilename(d.nom)}.pdf`,
    fieldKeys: ['prenom', 'nom', 'adresse', 'quartier', 'commune', 'ville', 'dateNaissance', 'lieuNaissance', 'nationalite', 'profession', 'usage', 'nombreCopies', 'date'],
    previewGroups: [
      { title: 'Résident', fields: [['prenom', 'Prénom'], ['nom', 'Nom'], ['adresse', 'Adresse'], ['quartier', 'Quartier'], ['commune', 'Commune'], ['ville', 'Ville']] },
      { title: 'Informations complémentaires', fields: [['dateNaissance', 'Date de naissance'], ['lieuNaissance', 'Lieu de naissance'], ['nationalite', 'Nationalité'], ['profession', 'Profession'], ['usage', 'Usage'], ['nombreCopies', 'Nombre de copies'], ['date', 'Date']] },
    ],
    render(doc, d, theme) {
      pdfHeader(doc, 'CERTIFICAT DE RÉSIDENCE', theme);
      sectionTitle(doc, 'Identité du demandeur', theme);
      field(doc, 'Nom complet', `${d.prenom} ${d.nom}`.trim(), theme);
      field(doc, 'Date et lieu de naissance', `${d.dateNaissance} à ${d.lieuNaissance}`.trim(), theme);
      field(doc, 'Nationalité', d.nationalite, theme);
      field(doc, 'Profession', d.profession, theme);
      sectionTitle(doc, 'Adresse', theme);
      field(doc, 'Adresse', d.adresse, theme);
      field(doc, 'Quartier', d.quartier, theme);
      field(doc, 'Commune', d.commune, theme);
      field(doc, 'Ville', d.ville, theme);
      sectionTitle(doc, 'Usage', theme);
      bodyText(doc, `Le présent certificat est demandé pour l'usage suivant : ${d.usage}. Nombre de copies souhaitées : ${d.nombreCopies}.`);
      doc.moveDown(1.5);
      doc.text(`Fait à ${d.ville}, le ${d.date}`);
      doc.moveDown(2);
      doc.text('Autorité compétente / Signature', { align: 'right' });
    },
  },
  'lettre-recommandation': {
    title: 'Lettre de recommandation',
    filename: (d) => `lettre_recommandation_${safeFilename(d.nomCandidat)}.pdf`,
    fieldKeys: ['prenomRedacteur', 'nomRedacteur', 'titreRedacteur', 'entrepriseRedacteur', 'emailRedacteur', 'telRedacteur', 'prenomCandidat', 'nomCandidat', 'posteCandidat', 'dureeCollaboration', 'qualites', 'realisations', 'conclusion', 'ville', 'date'],
    previewGroups: [
      { title: 'Rédacteur', fields: [['prenomRedacteur', 'Prénom'], ['nomRedacteur', 'Nom'], ['titreRedacteur', 'Titre'], ['entrepriseRedacteur', 'Entreprise'], ['emailRedacteur', 'Email'], ['telRedacteur', 'Téléphone']] },
      { title: 'Candidat', fields: [['prenomCandidat', 'Prénom'], ['nomCandidat', 'Nom'], ['posteCandidat', 'Poste'], ['dureeCollaboration', 'Durée de collaboration']] },
      { title: 'Recommandation', fields: [['qualites', 'Qualités'], ['realisations', 'Réalisations'], ['conclusion', 'Conclusion'], ['ville', 'Ville'], ['date', 'Date']] },
    ],
    render(doc, d, theme) {
      pdfHeader(doc, 'LETTRE DE RECOMMANDATION', theme);
      doc.fontSize(11).font('Helvetica').fillColor(theme.textColor);
      doc.text(`${d.prenomRedacteur} ${d.nomRedacteur}`.trim());
      doc.text(`${d.titreRedacteur} — ${d.entrepriseRedacteur}`);
      if (d.emailRedacteur) doc.text(d.emailRedacteur);
      if (d.telRedacteur) doc.text(d.telRedacteur);
      doc.moveDown(0.5);
      doc.text(`${d.ville}, le ${d.date}`, { align: 'right' });
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fillColor(theme.accentColor).text(`Objet : Recommandation de ${d.prenomCandidat} ${d.nomCandidat}`.trim());
      doc.moveDown(0.5);
      doc.font('Helvetica').fillColor(theme.textColor).text('Madame, Monsieur,');
      doc.moveDown(0.4);
      bodyText(doc, `J'ai eu le plaisir de collaborer avec ${d.prenomCandidat} ${d.nomCandidat} pendant ${d.dureeCollaboration} dans le cadre de ses fonctions / missions de ${d.posteCandidat}.`);
      sectionTitle(doc, 'Qualités observées', theme);
      bodyText(doc, d.qualites);
      sectionTitle(doc, 'Réalisations marquantes', theme);
      bodyText(doc, d.realisations);
      sectionTitle(doc, 'Conclusion', theme);
      bodyText(doc, d.conclusion);
      doc.moveDown(1.5);
      doc.text(`${d.prenomRedacteur} ${d.nomRedacteur}`.trim(), { align: 'right' });
    },
  },
  'mise-en-demeure': {
    title: 'Mise en demeure',
    filename: (d) => `mise_en_demeure_${safeFilename(d.nomDebiteur)}.pdf`,
    fieldKeys: ['prenomCreancier', 'nomCreancier', 'adresseCreancier', 'emailCreancier', 'telCreancier', 'prenomDebiteur', 'nomDebiteur', 'adresseDebiteur', 'objet', 'montant', 'echeance', 'delaiReponse', 'ville', 'date'],
    previewGroups: [
      { title: 'Créancier', fields: [['prenomCreancier', 'Prénom'], ['nomCreancier', 'Nom'], ['adresseCreancier', 'Adresse'], ['emailCreancier', 'Email'], ['telCreancier', 'Téléphone']] },
      { title: 'Débiteur', fields: [['prenomDebiteur', 'Prénom'], ['nomDebiteur', 'Nom'], ['adresseDebiteur', 'Adresse']] },
      { title: 'Réclamation', fields: [['objet', 'Objet'], ['montant', 'Montant'], ['echeance', 'Échéance'], ['delaiReponse', 'Délai de réponse'], ['ville', 'Ville'], ['date', 'Date']] },
    ],
    render(doc, d, theme) {
      pdfHeader(doc, 'MISE EN DEMEURE', theme);
      doc.fontSize(11).font('Helvetica').fillColor(theme.textColor);
      doc.text(`${d.prenomCreancier} ${d.nomCreancier}`.trim());
      doc.text(d.adresseCreancier);
      if (d.emailCreancier) doc.text(d.emailCreancier);
      if (d.telCreancier) doc.text(d.telCreancier);
      doc.moveDown(0.5);
      doc.text(`${d.ville}, le ${d.date}`, { align: 'right' });
      doc.moveDown(0.5);
      doc.text(`${d.prenomDebiteur} ${d.nomDebiteur}`.trim());
      doc.text(d.adresseDebiteur);
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fillColor(theme.accentColor).text(`Objet : Mise en demeure pour ${d.objet}`);
      doc.moveDown(0.5);
      bodyText(doc, `Par la présente, je vous mets formellement en demeure de régulariser la situation relative à ${d.objet}, pour un montant de ${d.montant} FCFA, dont l'échéance initiale était fixée au ${d.echeance}.`);
      bodyText(doc, `Je vous prie de procéder au règlement ou de me faire parvenir vos observations dans un délai de ${d.delaiReponse} à compter de la réception de cette lettre.`);
      bodyText(doc, 'À défaut de réponse dans ce délai, je me réserve le droit d\'engager toute procédure utile pour faire valoir mes droits.');
      doc.moveDown(1.5);
      doc.text(`${d.prenomCreancier} ${d.nomCreancier}`.trim(), { align: 'right' });
    },
  },
  'attestation-scolarite': {
    title: 'Attestation de scolarité',
    filename: (d) => `attestation_scolarite_${safeFilename(d.nomEleve)}.pdf`,
    fieldKeys: ['directeur', 'titreDirecteur', 'etablissement', 'adresseEtablissement', 'prenomEleve', 'nomEleve', 'dateNaissanceEleve', 'classe', 'anneeScolaire', 'ville', 'date'],
    previewGroups: [
      { title: 'Établissement', fields: [['directeur', 'Directeur'], ['titreDirecteur', 'Titre'], ['etablissement', 'Établissement'], ['adresseEtablissement', 'Adresse']] },
      { title: 'Élève', fields: [['prenomEleve', 'Prénom'], ['nomEleve', 'Nom'], ['dateNaissanceEleve', 'Date de naissance'], ['classe', 'Classe'], ['anneeScolaire', 'Année scolaire'], ['ville', 'Ville'], ['date', 'Date']] },
    ],
    render(doc, d, theme) {
      pdfHeader(doc, 'ATTESTATION DE SCOLARITÉ', theme);
      doc.fontSize(11).font('Helvetica').fillColor(theme.textColor);
      doc.text(d.etablissement, { align: 'center' });
      doc.text(d.adresseEtablissement, { align: 'center' });
      doc.moveDown(1);
      sectionTitle(doc, 'Attestation', theme);
      bodyText(doc, `Je soussigné(e), ${d.directeur}, ${d.titreDirecteur} de l'établissement ${d.etablissement}, atteste que l'élève ${d.prenomEleve} ${d.nomEleve}, né(e) le ${d.dateNaissanceEleve}, est régulièrement inscrit(e) en classe de ${d.classe} au titre de l'année scolaire ${d.anneeScolaire}.`);
      doc.moveDown(0.5);
      bodyText(doc, 'La présente attestation est délivrée à l\'intéressé(e) pour servir et valoir ce que de droit.');
      doc.moveDown(1.5);
      doc.text(`Fait à ${d.ville}, le ${d.date}`, { align: 'right' });
      doc.moveDown(1);
      doc.text(`${d.directeur}`, { align: 'right' });
      doc.text(`${d.titreDirecteur}`, { align: 'right' });
    },
  },
};

const docTypes = Object.keys(docDefinitions);

// Long fields (profil, formation, motivation…) can reasonably reach 2000 chars,
// so we use 2000 as the global upper bound to accommodate all field types.
function sanitize(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim().slice(0, 2000);
}

function safeFilename(value) {
  const base = sanitize(value || '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return base || 'document';
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getTheme(themeName) {
  const themes = {
    classique: {
      name: 'classique',
      headerBg: '#1B5E20',
      accentColor: '#FFD700',
      textColor: '#333333',
      headerText: '#FFFFFF',
      borderColor: '#1B5E20',
      surfaceColor: '#F5F5F5',
      labelColor: '#1B5E20',
      mutedColor: '#666666',
    },
    moderne: {
      name: 'moderne',
      headerBg: '#1A237E',
      accentColor: '#FF6D00',
      textColor: '#1F2937',
      headerText: '#FFFFFF',
      borderColor: '#1A237E',
      surfaceColor: '#EEF2FF',
      labelColor: '#1A237E',
      mutedColor: '#4B5563',
    },
    minimaliste: {
      name: 'minimaliste',
      headerBg: '#FFFFFF',
      accentColor: '#111111',
      textColor: '#111111',
      headerText: '#111111',
      borderColor: '#111111',
      surfaceColor: '#FFFFFF',
      labelColor: '#111111',
      mutedColor: '#6B7280',
    },
  };

  return themes[themeName] || themes.classique;
}

function startPDF(res, filename) {
  const doc = new PDFDocument({ margin: 48, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);
  return doc;
}

function pdfHeader(doc, title, theme) {
  const pageWidth = doc.page.width;
  const margin = 48;

  if (theme.name === 'minimaliste') {
    /* ── Minimaliste: thin top border + title block ── */
    doc.rect(0, 0, pageWidth, 4).fill(theme.borderColor);
    doc.moveDown(1.2);
    doc.fillColor(theme.headerText).fontSize(20).font('Helvetica-Bold')
       .text(title, margin, 28, { align: 'center', width: pageWidth - margin * 2 });
    doc.moveDown(0.4);
    doc.moveTo(margin, doc.y).lineTo(pageWidth - margin, doc.y)
       .strokeColor(theme.borderColor).lineWidth(0.7).stroke();
    doc.moveDown(1.2);
  } else {
    /* ── Classique / Moderne: coloured header band ── */
    const hdrH = 96;
    doc.rect(0, 0, pageWidth, hdrH).fill(theme.headerBg);
    doc.rect(0, hdrH - 4, pageWidth, 4).fill(theme.accentColor);

    /* Document title — large, centred, white */
    doc.fillColor(theme.headerText).fontSize(22).font('Helvetica-Bold')
       .text(title, margin, 22, { align: 'center', width: pageWidth - margin * 2 });

    /* Subtitle line */
    doc.fillColor(theme.accentColor).fontSize(9).font('Helvetica')
       .text('DOCUMENT ADMINISTRATIF OFFICIEL', margin, 58, { align: 'center', width: pageWidth - margin * 2, characterSpacing: 1.2 });

    /* Generation date — far right */
    const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.fillColor(theme.headerText).fontSize(8).font('Helvetica')
       .opacity(0.65)
       .text(`Émis le : ${dateStr}`, margin, 72, { align: 'right', width: pageWidth - margin * 2 })
       .opacity(1);

    doc.moveDown(2.5);
  }

  /* Underline below title */
  doc.moveTo(margin, doc.y + 4).lineTo(pageWidth - margin, doc.y + 4)
     .strokeColor(theme.accentColor).lineWidth(theme.name === 'minimaliste' ? 0.7 : 1.5).stroke();
  doc.moveDown(1.5);
  doc.fillColor(theme.textColor).font('Helvetica').fontSize(10);
}

function pdfFooter(doc, theme) {
  const pageWidth  = doc.page.width;
  const bottom     = doc.page.height - 50;
  const margin     = 48;
  const dateStr    = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const refId      = Math.random().toString(36).slice(2, 10).toUpperCase();

  doc.moveTo(margin, bottom).lineTo(pageWidth - margin, bottom)
     .strokeColor(theme.accentColor).lineWidth(0.8).stroke();

  /* Left: generation date + reference */
  doc.fillColor(theme.mutedColor).fontSize(7.5).font('Helvetica')
     .text(`Émis le ${dateStr} — Réf : ${refId}`, margin, bottom + 8, { width: 240 });

  /* Center: legal warning */
  doc.fillColor(theme.mutedColor).fontSize(7).font('Helvetica')
     .text('Ce document est fourni à titre indicatif. Toute falsification est passible de poursuites pénales.', margin, bottom + 8, {
       align: 'center', width: pageWidth - margin * 2
     });

  /* Right: generated by */
  doc.fillColor(theme.mutedColor).fontSize(7.5).font('Helvetica')
     .text('Généré via afridoc.app', pageWidth - margin - 140, bottom + 8, { width: 140, align: 'right' });
}

function field(doc, label, value, theme) {
  doc.fillColor(theme.labelColor).font('Helvetica-Bold').fontSize(10).text(`${label}: `, { continued: true });
  doc.fillColor(theme.textColor).font('Helvetica').text(value || '_____________________________');
}

function sectionTitle(doc, title, theme) {
  doc.moveDown(0.8);
  const y = doc.y;
  if (theme.name === 'minimaliste') {
    doc.rect(48, y, doc.page.width - 96, 22).lineWidth(0.7).strokeColor(theme.borderColor).stroke();
  } else {
    doc.rect(48, y, doc.page.width - 96, 22).fill(theme.surfaceColor);
  }
  doc.fillColor(theme.labelColor).fontSize(12).font('Helvetica-Bold').text(title.toUpperCase(), 56, y + 5, { width: doc.page.width - 112 });
  doc.moveDown(1.2);
  doc.fillColor(theme.textColor).font('Helvetica').fontSize(10);
}

function bodyText(doc, text) {
  if (!text) return;
  doc.font('Helvetica').text(text, { align: 'justify' });
}

function getDocTitle(type) {
  return docDefinitions[type] ? docDefinitions[type].title : type;
}

function collectData(type, body) {
  const definition = docDefinitions[type];
  return definition.fieldKeys.reduce((acc, key) => {
    acc[key] = sanitize(body[key]);
    return acc;
  }, {});
}

function formatPreviewValue(value) {
  return escapeHtml(value).replace(/\n/g, '<br>');
}

function buildPreviewHtml(type, data) {
  const definition = docDefinitions[type];
  if (!definition) return '';

  const html = definition.previewGroups.map((group) => {
    const rows = group.fields
      .map(([key, label]) => {
        if (!data[key]) return '';
        return `<div class="preview-line"><strong>${escapeHtml(label)} :</strong> ${formatPreviewValue(data[key])}</div>`;
      })
      .join('');
    if (!rows) return '';
    return `<section><h4>${escapeHtml(group.title)}</h4>${rows}</section>`;
  }).join('');

  return html || '<section><p>Aucune donnée fournie.</p></section>';
}

function finishPDF(doc) {
  doc.end();
  if (global.docStats) global.docStats.total++;
}

router.get('/:type/preview', (req, res, next) => {
  const { type } = req.params;
  if (!docTypes.includes(type)) return next();
  res.render(`documents/${type}`, { preview: true, docType: type, docTitle: getDocTitle(type) });
});

router.post('/:type/preview', async (req, res, next) => {
  try {
    const { type } = req.params;
    if (!docTypes.includes(type)) return next();
    const theme = sanitize(req.body.theme) || 'classique';
    const data = collectData(type, req.body);
    const previewHtml = buildPreviewHtml(type, data);
    const docTitle = getDocTitle(type);
    const qrCodeDataUrl = await QRCode.toDataURL(`${req.protocol}://${req.get('host')}/documents/${type}`, {
      width: 180,
      margin: 1,
    });
    res.render('documents/preview', { docType: type, docTitle, data, theme, previewHtml, qrCodeDataUrl });
  } catch (error) {
    next(error);
  }
});

router.get('/:type', (req, res, next) => {
  const { type } = req.params;
  if (!docTypes.includes(type)) return next();
  res.render(`documents/${type}`, { preview: req.query.preview === 'true', docType: type, docTitle: getDocTitle(type) });
});

docTypes.forEach((type) => {
  router.post(`/${type}/generate`, (req, res) => {
    const definition = docDefinitions[type];
    const theme = getTheme(sanitize(req.body.theme) || 'classique');
    const data = collectData(type, req.body);
    const doc = startPDF(res, definition.filename(data));
    definition.render(doc, data, theme);
    pdfFooter(doc, theme);
    finishPDF(doc);
  });
});

module.exports = router;
