# check-md-links

![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)
<a href="https://github.com/prestavera/check-md-links/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/prestavera/check-md-links/actions/workflows/ci.yml/badge.svg"></a>
![Licence MIT](https://img.shields.io/badge/Licence-MIT-yellow.svg)

## Description

`check-md-links` est un petit outil en ligne de commande qui extrait les URL HTTP et HTTPS d’un fichier Markdown, suit leurs redirections et signale celles qui ne répondent pas correctement. Il ne nécessite aucune dépendance externe et s’appuie sur l’API `fetch` native de Node.js.

Chaque requête est annulée après 10 secondes. Le programme renvoie le code de sortie `1` dès qu’au moins un lien est cassé, ce qui le rend adapté aux pipelines d’intégration continue.

Prérequis : Node.js 18 ou une version ultérieure.

## Installation et utilisation

Exécutez le paquet avec `npx` en indiquant le fichier Markdown à analyser :

```console
npx check-md-links docs/guide.md
```

Sans argument, `README.md` est utilisé par défaut :

```console
npx check-md-links
```

Depuis un clone local du dépôt, aucune installation n’est nécessaire :

```console
node index.js README.md
```

## Exemple de sortie console

```text
🔎 Vérification de 2 lien(s) dans README.md

✅ https://nodejs.org/
✅ https://opensource.org/license/mit

✅ Tous les liens sont valides
```

Pour un lien inaccessible, la ligne concernée est préfixée par `❌`, un résumé est affiché et la commande se termine avec le code `1`.

## Intégration CI

Le workflow GitHub Actions inclus exécute le contrôle à chaque `push` et pour chaque `pull_request`. Dans un autre pipeline, la commande suivante suffit :

```yaml
- name: Vérifier les liens Markdown
  run: npx check-md-links README.md
```

## Licence

Ce projet est distribué sous licence MIT. Consultez le fichier [LICENSE](LICENSE).
