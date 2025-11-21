# ShortUrl
Short url redirector for Cloudflare Worker with D1 database.

Language: JavaScript

Platform: Cloudflare Worker with D1 database.

# Features

- Deploy in Cloudflare directly using Worker.
- Multiple host names supported.

# Deploy

See [deployment](deployment.md) file.

# Management

See [management](management.md) file.

# Work flow
When a request is received by ShortUrl, it will follow these steps.

1. Gets the ``host`` from the HTTP Header.
2. Gets the ``path segments`` from the HTTP Header as the ``access key``.
3. Enters the Global Management page when
   - The ``access key`` equals to ``Global Management Key``. And,
   - The ``host`` is allowed to enter Global Management page when
     - The ``host`` exists in ``Global Management Enabled Hosts``. Or,
     - The list ``Global Management Enabled Hosts`` is empty.
4. Resolves by aliases when the ``host`` equals(*1) the ``Alias`` column of one record in ``Aliases`` from Global Management, choosing ``Target`` as the new value of ``host`` and restart this step. Aliases could be resolved recursively with 16 as the max depth.
5. Processes the request against the domain when the ``host`` equals(*1) ``Domain`` column of one record in ``Domains`` from Global Management.
   1. Enters the Domain Management page when ``access key`` equals to ``Domain Management Key``.
   2. Resolves by redirects when the ``access key`` equals(*2) the address column of one record in Redirects from Domain Management of this domain.
      - When the ``Target`` from the record matched is starting with ``>``, gets the text after ``>`` from ``Target`` as the new value of ``access key`` and restart this step. Redirects could be resolved recursively with 16 as the max depth. Or,
      - Redirects to ``Target`` specified of the record matched.
   3. Redirects to ``Default Redirect Target`` specified in Domain Management of this domain if it is not empty.
6. Redirects to ``Default Redirect Target`` specified in Global Management.

## (*1) Host name matching

- Host name matching is case insensitive.
- Port number 443 should not present, but all others should and will be treated separately. For example:
  - The record ``example.com`` will be matched with the host ``example.com`` and ``example.com:443``.
  - The record ``example.com:8080`` will be matched with the host ``example.com:8080`` only.
- The record with the key ends with ``:443`` in domains or aliases will not be matched unless it's pointed by other matched alias records.

## Redirect name matching

Name matching could be case sensitive or insensitive, based on the setting ``Ignore Case When Matching`` specified in the Domain Management of the related domain.

When redirecting:

- HTTP 308 will be used, when ``Use HTTP 308 instead of 307`` or ``Use HTTP 308`` is selected. Or HTTP 307 will be used.
- When ``Attach Query Process`` is enabled and the query string exists from the request:
  - When character ``?`` presents in the target of the redirection, ``&`` and the query string from the request will be appended.
  - When character ``?`` absents from the target of the redirection, ``?`` and the query string from the request will be appended.
- When ``Attach Query Process`` is disabled, the query string, if exists, from the request will be dropped and will not be passed into the redirection target.
