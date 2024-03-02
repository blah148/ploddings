# the Ploddings site

Ploddings provides a 'workstation for blues guitar and other musings' with..
- Note-for-note guitar tablature,
- Instructional videos,
- As well as slow-downer & pitch-shifter tools built-in.

Visit the live version at: [Ploddings](https://ploddings.com)

It's made with NextJS, at the moment using server-side rendering mainly for user authentication and fetching of initial important props, while using client-side rendering for the bulk of content fetching. The custom database is built with PostgreSQL Supabase, alongside files stored with 3rd-party tools such as MuseScore, Youtube, Dropbox, and B2 Cloud Storage.

The "vision" of Ploddings is to make the learning of, particularly, blues, jazz, folk, and classical guitar easier to accomplish online.. easier financially, since it's free to use, technically, since the content is custom-curated, and accessibility-wise, with good web usability in mind.

## Getting Started

To try out the structure the repo, unzip the contents, open the root in Bash, then enter the following Yarn command.

```bash
yarn dev
```
As it's built not, the development environment is setup with [http://localhost:3000](http://localhost:3000), launchable with your browser.

### i) Root

More important files like the "db-utilities.js", which contains the functions for GetServerSideProps, or the "ZustandStore.js", containing the functionality for the omnipresent sidebar (for desktop-usage) is contained in the root folder, the highest-level folder of the repo.

### ii) 1-Level Deep

While the root-level is the most surface-level container of the repo, the folders become more relevant 1-level deeper. The "/root/components" folder has all the encapsulated elements, from the Wikipedia SVG icon to the slow-downer tool, used within the pages, mainly to avoid messy, hard-to-read return HTML in those files. The "/root/context" folder contains the functionality for: (i) the loading state and (ii) light/dark mode, both of which are persistent throughout the site, so it seems suitable to set them up as contexts. Inside the "/root/styles" folder are the CSS files and webfonts.. the CSS files are somewhat haphazardly set-up with the "songs.module.css" file taking care of the dynamic routes (threads, blog, songs), and the "global.css" taking care of all else. The "/root/utils" folder contains functions mostly for transacting with the Supabase database, plus some other encapsulated code. The "/root/public" folder has the site's favicon and a couple other files relevant for SEO metadata. Last but not least is the "/root/pages" folder, which contains all the routes/URL-paths that users can visit on the front-end.

### iii) 2-levels Deep

This will mostly discuss the contents of the "/root/pages" folder, since that's mainly where things get 2-levels deep in the repo. At the surface of "/root/pages" are the static pages, such as the "/account" or "/login" or "/privacy-policy" pages, not least of all is the "index.js" for the homepage. The 3 important folders are then: (i) "/root/pages/threads", (ii) "/root/pages/blog", and (iii) "/root/pages/songs".. these each contain a dynamic JS file which branch-off, on the front-end, to the various dynamic pages dictated by the Supabase contents. They're where the most "contentful" parts of the site are located, with the tablature, song slow-downer tools, blog content, and so on.

## Suggested editing tools

A simple-setup for those new to this type of stack could include:
- Ubuntu/Linux as the OS, to use the Bash/Git command-line interface
- Vim as the code-editor
- ChatGPT 3.5/4 to convert natural-language ideas into usable JS code or for code analysis

## Contributions

There are endless areas in which the project, which is essentially a web-development project, can be added-to. These are just a few ideas:
- Aesthetics: unifying the CSS & overall appearance of the site
- Aesthetics: setting up the light/dark mode functionality
- Security: shifting certain database fetching functions server-side
- Content: curating high-quality tablature from MuseScore for the site
- Content: transcribing music into MIDI-tablature form to be featured
- Quality Assurance: testing the application on different browsers

## Apache 2.0 License

The license chosen, at this time, for the project is the Apache 2.0 License, meaning the structure of the site is copyable, so long as the copies are licensed in the same manner. Apart from the site structure, the slow-downer tool is likely the next-most useful piece of software to use, which is usable with the same license.

## Contact

The easiest way to keep-in-touch for this project is directly within this repo, whether it's by reporting a bug or by contacting the project owner via the Github profile.

## Thank you

Please do not hesitate to make-use of the project by visiting ploddings.com. Even if you are not a coder, any ideas to improve are always welcome. 
