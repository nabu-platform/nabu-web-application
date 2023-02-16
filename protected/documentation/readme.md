# Optimization

In the past, development would just recalculate everything (javascript, scss compilation,...) on every call. Production environments would do this once and cache the result. If you had the compressor enabled, it would compress the end result and cache that.
This works well except for the initial hit. Warmup routines (to take the first hit) were temporarily active but in the end rarely used.
Combined with some other potential initial load overheads, first hits after restart could be brutal.

A problem that made the initial hit thing worse is that there was an initial hit _per language_ because we compiled and cached per language. Compiling the javascript is not too bad of a hit (2-5s), but compressing it can take up to 30s.
This still stems from the "olden" days before page builder, when we wrote actual html and javascript for each project. This meant that we embedded our copy etc into the actual files.

These days we don't really write html and javascript for a specific project, preventing the need for project-specific copy in those files.

## Optimization effort

Once you toggle the "optimizeLoad" boolean in the web application, you get different behavior.
Development will still recalculate everything but will also dump the end result to a cache folder.
Upon commit, the files available here are compressed and the compilation is stored as well in the same location.

A production server can then simply take that calculated result and not suffer an initial hit.

However, this requires some changes:

- environment parameters
- environment data

## Translations

Ideally there is only one file for html/js/css instead of one per language. It is not inconceivable to have one per language, but this is much harder to keep in sync from a development perspective. Say someone updates something that impacts the javascript but only tests a single language in dev. That means, without doing anything special, the other languages won't have updated caches.

Or what if you have a language that only exists in prd, it will never have a cache.

Because we have been using page builder for quite a few years now, we rarely use dedicated copy in static files AND we have standardized translation routines, it is much easier to either remove translations alltogether from the static files or make sure we always wrap them in translation logic before showing them.

## Environment parameters

A bigger initial challenge is dealing with environment properties. Throughout the code there are tiny glue snippets like this: ${server.root()}.
Applications need to be able to run on multiple environments and even things like the root path of the web application can be different per environment.
Combine that with our pre-page-builder background of building applications entirely in html and javascript, and it felt natural to use the glue syntax for this.

Additionally, ideally, whatever solution we come up with is as much backwards compatible as possible.

This particular syntax is of course rather nabu/glue specific and makes the end result slightly less portable. This is not a primary concern, but any gains made in portability would be nice.

Note that even very low level libraries with no apparent dependencies sometimes need environmental data (like router, ajax,...). This means whatever mechanism we choose will be a root level dependency for nearly the entire system.

Apart from the ${} logic, we have long had a global application.configuration object that maintained some necessary configuration, it too used ${} to inject the necessary environment parameters. The idea is to expand on that.

We replace all the hardcoded references to ${server.root()} with for instance application.configuration.root. This is slightly more portable because it creates a frontend dependency on a simple object rather than a backend dependency on string replacement with its own configuration.

Of course, the current application.configuration also used ${server.root()} which doesn't work, so instead we add a new rest call that gets the environment data and enriches the application.configuration correctly.

This does assume that nobody needs this configuration until the enrichment process is finished. This might require some tricky loading sequence guarantees.

Of course, if we do nothing else, this means our static javascript file contains all the environmental data from development. I consider this to be a security leak so instead, if you toggle the "optimized" boolean, the default application.js will now generate "unavailable" for all the key information.

So in short, once optimized, application.configuration contains mostly "unavailable" until the environment rest call kicks in and sets the actual data in javascript.

## Environment data

The last bit that sometimes gets injected into javascript is environmental data. A good example of this is preloaded masterdata. This is injected as a json string into the javascript itself.

There arent many examples of this, but there are enough that you have to be careful.

"Normally" this always revolves around data where development can be considered the master (e.g. masterdata) and where deployment actions are used to port the same data to production, keeping the necessary ids in sync.
However, if you forgot to add deployment actions, the masterdata may have been regenerated in prd with different ids.

The end solution is to not embed data like this because it makes the application more fragile.

However, replacing all these instances with point-to-point rest calls may have a noticeable impact on loading times.

One potential solution is that the environment rest service uses a specification to allow other systems to inject their own data into the resultset. This means we can reuse that one call to get more data.
For example the specification might return an object which is JSON stringified by the environment service and unstringified again in the frontend. This makes it transparent for the people using it.