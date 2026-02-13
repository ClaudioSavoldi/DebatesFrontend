# DebateHub – Frontend (link BackEndRepo https://github.com/ClaudioSavoldi/DebatePlatform.Api.git)

DebateHub è una piattaforma web per la gestione di dibattiti strutturati Pro vs Contro con sistema di voto pubblico.  
Questo repository contiene il frontend sviluppato in React.

## Tecnologie utilizzate

- React
- React Router
- Redux Toolkit
- Bootstrap 5
- JWT Decode
- Vite

## Architettura generale

L'applicazione è strutturata in:

- Pagine pubbliche (consultazione match, risultati, lettura dibattiti)
- Area autenticata (Dashboard, partecipazione ai match, creazione dibattiti)
- Area moderatore (gestione e approvazione dibattiti)
- Sistema di gestione stato dei match (Opening → Rebuttal → Voting → Closed)
- Sistema di autenticazione con JWT
- Gestione ruoli (Utente / Moderatore)
- Separazione netta tra flusso pubblico e flusso partecipante

## Funzionalità principali

### Utenti non autenticati
- Visualizzazione dei topic disponibili
- Visualizzazione match pubblici
- Lettura opening e rebuttal
- Votazione (solo in fase Voting, previa autenticazione)

### Utenti autenticati
- Partecipazione ai dibattiti (Pro / Contro)
- Dashboard personale
  - Match attivi
  - Match conclusi
  - Iscrizioni in coda
- Scrittura Opening
- Scrittura Rebuttal
- Visualizzazione risultati

### Moderatore
- Approvazione o rifiuto dei dibattiti creati dagli utenti

## Gestione stato dei match

Ogni match segue un ciclo di vita strutturato:

1. Opening
2. Rebuttal
3. Voting
4. Closed

Il frontend reagisce dinamicamente allo stato del match mostrando:

- Editor solo quando consentito
- Badge fase
- Pannello voto solo in fase Voting
- Risultato finale in fase Closed



