# Management

All settings could be changed in database. Using management pages is recommended. If the management key is forgotten, retrieve it from table GlobalSetting of database.

# Management Key

Management keys are the only validation for management, which should be kept in secret.

* Global Management key
  - only has one.
  - is the key for entering the Global Management page.
  - can be obtained from the table GlobalSetting of database.
  - is displayed and can be changed in Global Management page.
* Domain Management key
  - can be set separately for each domain name.
  - is the key for entering the Domain Management page of the related domain.
  - can be obtained from the table DomainSetting of database.
  - is used as part of the url of the Manage button in Domains block of Global Management page.
  - is displayed and can be changed in the Domain Management page of the related domain.
 
For safety reasons, you should modify Management Keys as soon as possible.

# Global Management page

Global Management page is designed for managing domains and setting default redirection for the requests from domains other than exists.

## Global Setting
### Default Redirect Target
Sets an target for default redirection.

When the host supplied in HTTP Header is not resolved by aliases and / or is other than existing domain records, the request will be redirected to the target specified.

### Global Management Key
Changes the ``Global Management Key``. This will reload the whole page with the new key applied as the path segment of url to be requested.

### Global Management Enabled Hosts
Sets the hosts allowed to enter Global Management page.

All hosts are allowed when the list is empty.

When setting up, the current host must be added to the list first to allow the rest operating from this host. And due to the same reason, when removal, the current host must be the last one to be removed.

## Domains
Adds or removes domain, or navigates to Domain Management page of the selected domain.

To add a new domain, enter the domain name and press Add Domain button.
For domain removal and management, press the Remove or Manage button after the domain related.

After a domain added, you need also map the domain to this worker under ``Domains & Routes`` block of ``Settings`` tab of this worker dashboard page.

## Aliases
Adds, updates or removes domain aliases.

To add a new alias, enter the alias (key) and target, then press Add Alias button.
To update an alias with a new key and / or target, change the values and press Update button after the alias related.
To remove an alias, press Remove button after the alias related.

The target can be the Domain under Domains block, or another Alias under Aliases block for recursive resolving with 16 as the max depth.

After an alias added, you need also map the domain to this worker under ``Domains & Routes`` block of ``Settings`` tab of this worker dashboard page.

## Domain name and alias key
- Domain name and alias key matching is case insensitive.
- Port number 80 or 443 should not present, but all others should and will be treated separately. For example:
  - The record ``example.com`` will be matched with the host ``example.com``, ``example.com:80`` and ``example.com:443``.
  - The record ``example.com:8080`` will be matched with the host ``example.com:8080`` only.
- The record with the key ends with ``:80`` or ``:443`` in domains or aliases will not be matched unless it's pointed by other matched alias records.
- Multiple records with duplicate names or those differing only in capitalization are not allowed.

# Domain Management page

Domain Management page is designed for managing redirects of one domain and setting default redirection for the requests not matched with any redirects in this domain. 

## Domain Setting
### Default Redirect Target
Sets an target for default redirection.

When the path segment is not resolved by redirection records, the request will be redirected to the target specified.

### Domain Management Key
Changes the ``Domain Management Key`` of this domain. This will reload the whole page with the new key applied as the path segment of url to be requested.

### Ignore Case When Matching
Sets the name matching rules of redirection record should be case sensitive or not.

After enable this, the records with similar names with different case will be kept only one. If some records are removed by this action, the whole page will be reloaded.

## Redirects
Adds, updates or removes redirection records.

To add a new record, enter the address and target, select whether it should use HTTP 308, select how to treat query string, then press Add Redirect button.
To update a record, change the values and press Update button after the record related.
To remove a record, press Remove button after the record related.

The target can be:
- A text starting with ``//``: Redirects to this domain name, with path segments if presents, and query string if presents, using the same protocol as the user request. This should be the most common.
- A text starting with ``http://`` or ``https://``: Redirects to this domain name, with path segments if presents, and query string if presents, using the protocol specified.
- A text starting with ``>``: Marks this record as an alias to another one with the address equals the text after ``>``. Redirects could be resolved recursively with 16 as the max depth. In this case, settings other than address and target from this record will be ignored.
- A text starting with ``<``: Sets this record as a plain text equals the text after ``<``. For example, accessing ``<Hello World!`` will display ``Hello World!`` in plain text.
- A text starting with ``"``: Sets this record as a customized response. The text between the first and second ``"`` is treated as content type, as the rest as the content. For example, accessing ``"text/html"<html><head><meta http-equiv="refresh" content="0; URL=//www.github.com" /></head><body></body></html>`` will redirect to github.com.
- A text in other format: Redirects to the new place using this text as path segment.

When redirecting:
- HTTP 308 will be used, when ``Use HTTP 308 instead of 307`` or ``Use HTTP 308`` is selected. Or HTTP 307 will be used.
- When ``Attach Query Process`` is enabled and the query string exists from the request:
  - When character ``?`` presents in the target of the redirection, ``&`` and the query string from the request will be appended.
  - When character ``?`` absents from the target of the redirection, ``?`` and the query string from the request will be appended.
- When ``Attach Query Process`` is disabled, the query string, if exists, from the request will be dropped and will not be passed into the redirection target.

# See also

Checks [Work flow](readme.md#work-flow) for detailed processing of each request.
