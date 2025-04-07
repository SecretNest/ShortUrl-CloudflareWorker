var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

async function ReadGlobalSetting(env) {
  const response = await env.DB.prepare(
    "SELECT GlobalManagementKey,PreferXForwardedHost,DefaultTarget,IsDefaultTargetPermanent,DefaultTargetQueryProcess,GlobalManagementEnabledHosts FROM GlobalSetting LIMIT 1"
  ).run();
  const results = response.results;
  if (results.length === 1) {
    return results[0];
  } else {
    let defaultGlobalSetting = {
      GlobalManagementKey: "$$$$GlobalManagement$$$$",
      PreferXForwardedHost: 1,
      DefaultTarget: "https://secretnest.info",
      IsDefaultTargetPermanent: 0,
      DefaultTargetQueryProcess: 0,
      GlobalManagementEnabledHosts: ""
    };
    await env.DB.prepare(
      "INSERT INTO GlobalSetting (GlobalManagementKey, PreferXForwardedHost, DefaultTarget, IsDefaultTargetPermanent, DefaultTargetQueryProcess, GlobalManagementEnabledHosts) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(
      defaultGlobalSetting.GlobalManagementKey,
      defaultGlobalSetting.PreferXForwardedHost,
      defaultGlobalSetting.DefaultTarget,
      defaultGlobalSetting.IsDefaultTargetPermanent,
      defaultGlobalSetting.DefaultTargetQueryProcess,
      defaultGlobalSetting.GlobalManagementEnabledHosts
    ).run();
    return defaultGlobalSetting;
  }
}
__name(ReadGlobalSetting, "ReadGlobalSetting");
async function SaveGlobalDefaultTarget(env, target, permanent, queryProcess) {
  await env.DB.prepare(
    "UPDATE GlobalSetting SET DefaultTarget=?, IsDefaultTargetPermanent=?, DefaultTargetQueryProcess=?"
  ).bind(target, permanent, queryProcess).run();
}
__name(SaveGlobalDefaultTarget, "SaveGlobalDefaultTarget");
async function SaveGlobalManagementKey(env, globalManagementKey) {
  await env.DB.prepare("UPDATE GlobalSetting SET GlobalManagementKey=?").bind(globalManagementKey).run();
}
__name(SaveGlobalManagementKey, "SaveGlobalManagementKey");
async function SaveGlobalManagementEnabledHosts(env, globalManagementEnabledHosts) {
  await env.DB.prepare("UPDATE GlobalSetting SET GlobalManagementEnabledHosts=?").bind(globalManagementEnabledHosts).run();
}
__name(SaveGlobalManagementEnabledHosts, "SaveGlobalManagementEnabledHosts");
async function ReadDomainAliases(env) {
  const response = await env.DB.prepare(
    "SELECT Domain,TargetDomain FROM DomainAlias ORDER BY DomainLower"
  ).run();
  const results = response.results;
  return results;
}
__name(ReadDomainAliases, "ReadDomainAliases");
async function GetDomainAlias(env, domainLower) {
  const response = await env.DB.prepare(
    "SELECT DomainLower,Domain,TargetDomainLower,TargetDomain FROM DomainAlias WHERE DomainLower=?"
  ).bind(domainLower).run();
  const results = response.results;
  if (!results || results.length === 0) {
    return null;
  }
  return results[0];
}
__name(GetDomainAlias, "GetDomainAlias");
async function RemoveDomainAlias(env, domainLower) {
  const result = await env.DB.prepare(
    "DELETE FROM DomainAlias WHERE DomainLower=?"
  ).bind(domainLower).run();
  return result && result.success && result.meta.changed_db;
}
__name(RemoveDomainAlias, "RemoveDomainAlias");
async function CreateDomainAlias(env, domainAlias) {
  try {
    const result = await env.DB.prepare(
      "INSERT INTO DomainAlias(DomainLower,Domain,TargetDomainLower,TargetDomain) VALUES(?,?,?,?)"
    ).bind(domainAlias.DomainLower, domainAlias.Domain, domainAlias.TargetDomainLower, domainAlias.TargetDomain).run();
    return result && result.success && result.meta.changed_db;
  } catch (error) {
    if (typeof error.message === "string" && error.message.includes("UNIQUE constraint failed:")) {
      return false;
    } else {
      throw error;
    }
  }
}
__name(CreateDomainAlias, "CreateDomainAlias");
async function UpdateDomainAlias(env, domainAlias, oldKey) {
  try {
    const result = await env.DB.prepare(
      "UPDATE DomainAlias SET DomainLower=?, Domain=?, TargetDomainLower=?, TargetDomain=? WHERE DomainLower=?"
    ).bind(domainAlias.DomainLower, domainAlias.Domain, domainAlias.TargetDomainLower, domainAlias.TargetDomain, oldKey).run();
    return result && result.success && result.meta.changed_db;
  } catch (error) {
    if (typeof error.message === "string" && error.message.includes("UNIQUE constraint failed:")) {
      return false;
    } else {
      throw error;
    }
  }
}
__name(UpdateDomainAlias, "UpdateDomainAlias");
async function ReadDomainSettings(env) {
  const response = await env.DB.prepare(
    "SELECT Domain,ManagementKey FROM DomainSetting ORDER BY DomainLower"
  ).run();
  const results = response.results;
  return results;
}
__name(ReadDomainSettings, "ReadDomainSettings");
async function GetDomainSetting(env, domainLower) {
  const response = await env.DB.prepare(
    "SELECT DomainLower,Domain,ManagementKey,IgnoreCaseWhenMatching,DefaultTarget,IsDefaultTargetPermanent,DefaultTargetQueryProcess FROM DomainSetting WHERE DomainLower=?"
  ).bind(domainLower).run();
  const results = response.results;
  if (!results || results.length === 0) {
    return null;
  }
  return results[0];
}
__name(GetDomainSetting, "GetDomainSetting");
async function RemoveDomainSetting(env, domainLower) {
  const result = await env.DB.prepare(
    "DELETE FROM DomainSetting WHERE DomainLower=?"
  ).bind(domainLower).run();
  if (result && result.success && result.meta.changed_db) {
    await env.DB.prepare(
      "DELETE FROM DomainRedirect WHERE DomainLower=?"
    ).bind(domainLower).run();
    return true;
  } else return false;
}
__name(RemoveDomainSetting, "RemoveDomainSetting");
async function CreateDomainSetting(env, domainSetting) {
  try {
    const result = await env.DB.prepare(
      "INSERT INTO DomainSetting(DomainLower,Domain,ManagementKey,IgnoreCaseWhenMatching,DefaultTarget,IsDefaultTargetPermanent,DefaultTargetQueryProcess) VALUES(?,?,?,?,?,?,?)"
    ).bind(
      domainSetting.DomainLower,
      domainSetting.Domain,
      domainSetting.ManagementKey,
      domainSetting.IgnoreCaseWhenMatching,
      domainSetting.DefaultTarget,
      domainSetting.IsDefaultTargetPermanent,
      domainSetting.DefaultTargetQueryProcess
    ).run();
    return result && result.success && result.meta.changed_db;
  } catch (error) {
    if (typeof error.message === "string" && error.message.includes("UNIQUE constraint failed:")) {
      return false;
    } else {
      throw error;
    }
  }
}
__name(CreateDomainSetting, "CreateDomainSetting");
async function SaveDomainDefaultTarget(env, domainLower, target, permanent, queryProcess) {
  await env.DB.prepare(
    "UPDATE DomainSetting SET DefaultTarget=?, IsDefaultTargetPermanent=?, DefaultTargetQueryProcess=? WHERE DomainLower=?"
  ).bind(
    target,
    permanent,
    queryProcess,
    domainLower
  ).run();
}
__name(SaveDomainDefaultTarget, "SaveDomainDefaultTarget");
async function SaveDomainManagementKey(env, domainLower, managementKey) {
  await env.DB.prepare("UPDATE DomainSetting SET ManagementKey=? WHERE DomainLower=?").bind(managementKey, domainLower).run();
}
__name(SaveDomainManagementKey, "SaveDomainManagementKey");
async function SaveDomainIgnoreCaseWhenMatching(env, domainLower, ignoreCaseWhenMatching) {
  await env.DB.prepare("UPDATE DomainSetting SET IgnoreCaseWhenMatching=? WHERE DomainLower=?").bind(ignoreCaseWhenMatching, domainLower).run();
}
__name(SaveDomainIgnoreCaseWhenMatching, "SaveDomainIgnoreCaseWhenMatching");
async function ReadDomainRedirects(env, domainLower) {
  const response = await env.DB.prepare(
    "SELECT Source, Target, IsPermanent, QueryProcess FROM DomainRedirect WHERE DomainLower=? ORDER BY DomainLower, SourceForMatching "
  ).bind(domainLower).run();
  const results = response.results;
  return results;
}
__name(ReadDomainRedirects, "ReadDomainRedirects");
async function GetDomainRedirect(env, domainLower, sourceForMatching) {
  const response = await env.DB.prepare(
    "SELECT DomainLower, SourceForMatching, Source, Target, IsPermanent, QueryProcess FROM DomainRedirect WHERE DomainLower=? AND SourceForMatching=?"
  ).bind(domainLower, sourceForMatching).run();
  const results = response.results;
  if (!results || results.length === 0) {
    return null;
  }
  return results[0];
}
__name(GetDomainRedirect, "GetDomainRedirect");
async function RemoveDomainRedirect(env, domainLower, sourceForMatching) {
  const result = await env.DB.prepare(
    "DELETE FROM DomainRedirect WHERE DomainLower=? AND SourceForMatching=?"
  ).bind(domainLower, sourceForMatching).run();
  return result && result.success && result.meta.changed_db;
}
__name(RemoveDomainRedirect, "RemoveDomainRedirect");
async function CreateDomainRedirect(env, domainRedirect) {
  try {
    const result = await env.DB.prepare(
      "INSERT INTO DomainRedirect(DomainLower, SourceForMatching, Source, Target, IsPermanent, QueryProcess) VALUES(?,?,?,?,?,?)"
    ).bind(
      domainRedirect.DomainLower,
      domainRedirect.SourceForMatching,
      domainRedirect.Source,
      domainRedirect.Target,
      domainRedirect.IsPermanent,
      domainRedirect.QueryProcess
    ).run();
    return result && result.success && result.meta.changed_db;
  } catch (error) {
    if (typeof error.message === "string" && error.message.includes("UNIQUE constraint failed:")) {
      return false;
    } else {
      throw error;
    }
  }
}
__name(CreateDomainRedirect, "CreateDomainRedirect");
async function UpdateDomainRedirect(env, domainRedirect, oldKey) {
  try {
    const result = await env.DB.prepare(
      "UPDATE DomainRedirect SET SourceForMatching=?, Source=?, Target=?, IsPermanent=?, QueryProcess=? WHERE DomainLower=? AND SourceForMatching=?"
    ).bind(
      domainRedirect.SourceForMatching,
      domainRedirect.Source,
      domainRedirect.Target,
      domainRedirect.IsPermanent,
      domainRedirect.QueryProcess,
      domainRedirect.DomainLower,
      oldKey
    ).run();
    return result && result.success && result.meta.changed_db ? 1 : 0;
  } catch (error) {
    if (typeof error.message === "string" && error.message.includes("UNIQUE constraint failed:")) {
      return 2;
    } else {
      throw error;
    }
  }
}
__name(UpdateDomainRedirect, "UpdateDomainRedirect");
async function TurnDomainRedirectToCaseSensitive(env, domainLower) {
  await env.DB.prepare(
    "UPDATE DomainRedirect SET SourceForMatching=Source WHERE DomainLower=?"
  ).bind(domainLower).run();
}
__name(TurnDomainRedirectToCaseSensitive, "TurnDomainRedirectToCaseSensitive");
async function TurnDomainRedirectToCaseInsensitive(env, domainLower) {
  const current = await env.DB.prepare(
    "SELECT SourceForMatching,Source FROM DomainRedirect WHERE DomainLower=?"
  ).bind(domainLower).run();
  const results = current.results;
  if (!results || results.length === 0) return true;
  const processed = /* @__PURE__ */ new Set();
  const toRemove = env.DB.prepare(
    "DELETE FROM DomainRedirect WHERE DomainLower=? AND SourceForMatching=?"
  );
  const toChange = env.DB.prepare(
    "UPDATE DomainRedirect SET SourceForMatching=? WHERE WHERE DomainLower=? AND SourceForMatching=?"
  );
  let removed = false;
  results.forEach(async (oldRecord) => {
    var lower = oldRecord.SourceForMatching.toLowerCase();
    if (processed.has(lower)) {
      await toRemove.bind(domainLower, oldRecord.SourceForMatching).run();
      removed = true;
    } else {
      processed.add(lower);
      await toChange.bind(lower, domainLower, oldRecord.SourceForMatching).run();
    }
  });
  return removed;
}
__name(TurnDomainRedirectToCaseInsensitive, "TurnDomainRedirectToCaseInsensitive");
async function GlobalManagementProcess(request, url, host, queryParams, globalManagementEnabledHosts, globalSetting, env) {
  switch (queryParams.get("verb")) {
    case "GetGlobalSetting": {
      let entity = {
        defaultTarget: {
          target: globalSetting.DefaultTarget,
          permanent: globalSetting.IsDefaultTargetPermanent == 1,
          queryProcess: globalSetting.DefaultTargetQueryProcess
        },
        globalManagementKey: globalSetting.GlobalManagementKey,
        globalManagementEnabledHosts,
        currentHost: host
      };
      return new Response(JSON.stringify(entity), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    case "GetCurrentHost":
      return new Response(host, {
        status: 200,
        headers: {
          "Content-Type": "text/plain"
        }
      });
    case "GetDomains": {
      let query = await ReadDomainSettings(env);
      let entity = query.map((record) => ({ domainName: record.Domain, managementKey: record.ManagementKey }));
      return new Response(JSON.stringify(entity), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    case "GetAliases": {
      let query = await ReadDomainAliases(env);
      let entity = query.map((record) => ({ alias: record.Domain, target: record.TargetDomain }));
      return new Response(JSON.stringify(entity), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    case "UpdateGlobalDefaultTarget": {
      globalSetting.DefaultTarget = queryParams.get("target");
      globalSetting.IsDefaultTargetPermanent = queryParams.get("permanent") == "true" ? 1 : 0;
      if (queryParams.get("queryProcess") == "true") {
        globalSetting.DefaultTargetQueryProcess = globalSetting.DefaultTarget.includes("?") ? 2 : 1;
      } else {
        globalSetting.DefaultTargetQueryProcess = 0;
      }
      await SaveGlobalDefaultTarget(env, globalSetting.DefaultTarget, globalSetting.IsDefaultTargetPermanent, globalSetting.DefaultTargetQueryProcess);
      let entity = {
        target: globalSetting.DefaultTarget,
        permanent: globalSetting.IsDefaultTargetPermanent == 1,
        queryProcess: globalSetting.DefaultTargetQueryProcess
      };
      return new Response(JSON.stringify(entity), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    case "UpdateGlobalManagementKey": {
      let newKey = queryParams.get("key");
      if (newKey) {
        globalSetting.GlobalManagementKey = newKey;
        await SaveGlobalManagementKey(env, globalSetting.GlobalManagementKey);
        return new Response(globalSetting.GlobalManagementKey, {
          status: 200,
          headers: {
            "Content-Type": "text/plain"
          }
        });
      } else return new Response(null, { status: 406 });
    }
    case "AddGlobalManagementEnabledHost": {
      let newHost = queryParams.get("hostName");
      if (newHost) {
        newHost = newHost.replace(/,/g, "");
        const newHostLower = newHost.toLowerCase();
        if (globalManagementEnabledHosts.some((item) => item.toLowerCase() === newHostLower)) {
          return new Response(null, { status: 409 });
        } else {
          if (globalSetting.GlobalManagementEnabledHosts == "") globalSetting.GlobalManagementEnabledHosts = newHost;
          else globalSetting.GlobalManagementEnabledHosts = globalSetting.GlobalManagementEnabledHosts + "," + newHost;
          await SaveGlobalManagementEnabledHosts(env, globalSetting.GlobalManagementEnabledHosts);
          let entity = {
            hostName: newHost
          };
          return new Response(JSON.stringify(entity), {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          });
        }
      } else return new Response(null, { status: 406 });
    }
    case "RemoveGlobalManagementEnabledHost": {
      let removingHost = queryParams.get("hostName");
      if (removingHost) {
        removingHost = removingHost.replace(/,/g, "");
        const removingHostLower = removingHost.toLowerCase();
        if (globalManagementEnabledHosts.some((item) => item.toLowerCase() === removingHostLower)) {
          globalManagementEnabledHosts = globalManagementEnabledHosts.filter((item) => item.toLowerCase() != removingHostLower);
          globalSetting.GlobalManagementEnabledHosts = globalManagementEnabledHosts.join(",");
          await SaveGlobalManagementEnabledHosts(env, globalSetting.GlobalManagementEnabledHosts);
          return new Response(null, { status: 204 });
        } else {
          return new Response(null, { status: 410 });
        }
      } else return new Response(null, { status: 406 });
    }
    case "AddDomain": {
      let newDomain = queryParams.get("domainName");
      if (newDomain) {
        const newDomainLower = newDomain.toLowerCase();
        let domainSetting = {
          DomainLower: newDomainLower,
          Domain: newDomain,
          ManagementKey: "$$$$DomainManagement$$$$",
          IgnoreCaseWhenMatching: 1,
          DefaultTarget: "https://secretnest.info",
          IsDefaultTargetPermanent: 0,
          DefaultTargetQueryProcess: 0
        };
        if (await CreateDomainSetting(env, domainSetting)) {
          let entity = {
            domainName: domainSetting.Domain,
            managementKey: domainSetting.ManagementKey
          };
          return new Response(JSON.stringify(entity), {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          });
        } else return new Response(null, { status: 409 });
      } else return new Response(null, { status: 406 });
    }
    case "RemoveDomain": {
      let removingDomain = queryParams.get("domainName");
      if (removingDomain) {
        const removingDomainLower = removingDomain.toLowerCase();
        if (await RemoveDomainSetting(env, removingDomainLower)) return new Response(null, { status: 204 });
        else return new Response(null, { status: 410 });
      } else return new Response(null, { status: 406 });
    }
    case "AddAlias": {
      let newAlias = queryParams.get("alias");
      let target = queryParams.get("target");
      if (newAlias && target) {
        const newAliasLower = newAlias.toLowerCase();
        const targetLower = target.toLowerCase();
        let domainAlias = {
          DomainLower: newAliasLower,
          Domain: newAlias,
          TargetDomainLower: targetLower,
          TargetDomain: target
        };
        if (await CreateDomainAlias(env, domainAlias)) {
          let entity = {
            alias: domainAlias.Domain,
            target: domainAlias.TargetDomain
          };
          return new Response(JSON.stringify(entity), {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          });
        } else return new Response(null, { status: 409 });
      } else return new Response(null, { status: 406 });
    }
    case "RemoveAlias": {
      let removingAlias = queryParams.get("alias");
      if (removingAlias) {
        const removingAliasLower = removingAlias.toLowerCase();
        if (await RemoveDomainAlias(env, removingAliasLower)) return new Response(null, { status: 204 });
        else return new Response(null, { status: 410 });
      } else return new Response(null, { status: 406 });
    }
    case "UpdateAlias": {
      let oldKey = queryParams.get("alias");
      let target = queryParams.get("target");
      let newAlias = queryParams.get("newAlias");
      if (oldKey && target && newAlias) {
        const oldKeyLower = oldKey.toLowerCase();
        const newAliasLower = newAlias.toLowerCase();
        const targetLower = target.toLowerCase();
        let domainAlias = {
          DomainLower: newAliasLower,
          Domain: newAlias,
          TargetDomainLower: targetLower,
          TargetDomain: target
        };
        if (await UpdateDomainAlias(env, domainAlias, oldKeyLower)) {
          let entity = {
            alias: domainAlias.Domain,
            target: domainAlias.TargetDomain
          };
          return new Response(JSON.stringify(entity), {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          });
        } else return new Response(null, { status: 410 });
      } else return new Response(null, { status: 406 });
    }
    default:
      return new Response(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
  <title>Global Management</title>
  <link rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css"
      integrity="sha256-+N4/V/SbAFiW1MPBCXnfnP9QSN3+Keu+NlB+0ev/YKQ="
      crossorigin="anonymous" />
  <link rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.min.css"
      integrity="sha256-L/W5Wfqfa0sdBNIKN9cG6QA5F2qx4qICmU2VgLruv9Y="
      crossorigin="anonymous" />
</head>
<body>
  <div id="root">
    <div class="container">
      <main class="mt-3">
        <h1 class="text-center lead">Global Management</h1>
        <hr />
        <div class="card">
          <div class="card-header" id="global-setting-head">
            <a href="#" data-toggle="collapse" data-target="#global-setting-body" aria-expanded="true" aria-controls="global-setting-head">Global Setting</a>
          </div>
          <div id="global-setting-body" class="collapse" aria-labelledby="global-setting-head">
            <div class="card-body">
              <div class="accordion" id="global-setting-accordion">
                <div class="card">
                  <div class="card-header" id="default-redirect-target-head">
                    <a href="#" data-toggle="collapse" data-target="#default-redirect-target-body" aria-expanded="true" aria-controls="default-redirect-target-head">Default Redirect Target</a>
                  </div>
                  <div id="default-redirect-target-body" class="collapse show" aria-labelledby="default-redirect-target-head" data-parent="#global-setting-accordion">
                    <div class="card-body">
                      <p class="card-text">All unmatched requests will be redirected to this address specified.</p>
                      <div class="form-group">
                        <label>Target</label>
                        <input class="form-control" type="url" v-model="globalSetting.defaultTarget.target" />
                        <small class="form-text text-muted">The address to be redirected to.</small>
                      </div>
                      <div class="form-group">
                        <div class="form-check">
                          <label class="form-check-label">
                            <input type="checkbox" class="form-check-input" v-model="globalSetting.defaultTarget.permanent" />
                            Use HTTP 308 instead of 307
                          </label>
                        </div>
                        <small class="form-text text-muted">Redirect with HTTP 308 will be cached by browser.</small>
                      </div>
                      <div class="form-group">
                        <div class="form-check">
                          <label class="form-check-label">
                            <input type="checkbox" class="form-check-input" v-model="globalSetting.defaultTarget.queryProcess" />  Attach Query String
                          </label>
                        </div>
                        <small class="form-text text-muted">Attach query string to the target.</small>
                      </div>
                      <hr />
                      <button type="button" class="btn btn-outline-secondary" v-on:click="updateGlobalDefaultTarget()">Update</button>
                    </div>
                  </div>
                </div>
                <div class="card">
                  <div class="card-header" id="global-management-key-head">
                    <a href="#" data-toggle="collapse" data-target="#global-management-key-body" aria-expanded="true" aria-controls="global-management-key-head">Global Management Key</a>
                  </div>
                  <div id="global-management-key-body" class="collapse" aria-labelledby="global-management-key-head" data-parent="#global-setting-accordion">
                    <div class="card-body">
                      <input type="url" v-model="globalSetting.globalManagementKey" class="form-control" />
                      <small class="form-text text-muted">Navigate to this page when using this setting as path segment.</small>
                      <hr />
                      <button type="button" class="btn btn-outline-secondary" v-on:click="updateGlobalManagementKey()">Update</button>
                    </div>
                  </div>
                </div>
                <div class="card">
                  <div class="card-header" id="global-management-enabled-host-head">
                    <a href="#" data-toggle="collapse" data-target="#global-management-enabled-host-body" aria-expanded="true" aria-controls="global-management-enabled-host-head">Global Management Enabled Hosts</a>
                  </div>
                  <div id="global-management-enabled-host-body" class="collapse" aria-labelledby="global-management-enabled-host-head" data-parent="#global-setting-accordion">
                    <div class="card-body">
                      <p class="card-text">Allow visiting this page by these host names below. Leave empty to allow accessing through all host names. The current host can only be added as the first record and be removed at last.</p>
                      <table class="table table-sm table-stripped mt-2">
                        <thead>
                          <tr>
                            <th>Domain Name</th>
                            <th>Operation</th>
                          </tr>
                        </thead>
                        <tbody>
                          <template v-if="globalSetting.globalManagementEnabledHosts && globalSetting.globalManagementEnabledHosts.length !== 0">
                            <tr v-for="host in globalSetting.globalManagementEnabledHosts">
                              <th>{{host}}</th>
                              <td>
                                <button type="button" class="btn btn-sm btn-danger" v-on:click="deleteHost(host)">Remove</button>
                              </td>
                            </tr>
                          </template>
                          <tr v-else>
                            <td colspan="2">
                              <div class="text-muted text-center m-2">There's no host record yet.</div>
                            </td>
                          </tr>
                          <tr>
                            <th>
                              <input type="text" class="form-control form-control-sm" v-model="newHostName" />
                            </th>
                            <td>
                              <button type="button" class="btn btn-sm btn-primary" v-on:click="addHost()">Add</button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card mt-3">
          <div class="card-header" id="domains-head">
            <a href="#" data-toggle="collapse" data-target="#domains-body" aria-expanded="true" aria-controls="domains-head">Domains</a>
          </div>
          <div id="domains-body" class="collapse show" aria-labelledby="domains-head">
            <table class="table table-stripped">
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Management</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in domains">
                  <th>{{item.domainName}}</th>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button type="button" class="btn btn-outline-secondary" v-on:click="manageDomain(item)">Manage</button>
                      <button type="button" class="btn btn-danger" v-on:click="removeDomain(item)">Remove</button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="text" v-model="newDomain" class="form-control form-control-sm" />
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button type="button" class="btn btn-primary" v-on:click="addDomain()">Add Domain</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="card mt-3">
          <div class="card-header" id="aliases-head">
            <a href="#" data-toggle="collapse" data-target="#aliases-body" aria-expanded="true" aria-controls="aliases-head">Aliases</a>
          </div>
          <div id="aliases-body" class="collapse show" aria-labelledby="aliases-head">
            <div class="card-body">
              <p class="card-text">Navigating from host which equals alias column of this table will be treated as to the host specified in target column of the same record.</p>
              <table class="table table-stripped">
                <thead>
                  <tr>
                    <th>Alias</th>
                    <th>Target</th>
                    <th>Management</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="aliases && aliases.length !== 0">
                    <tr v-for="item in aliases">
                      <th>
                        <input type="text" required="required" v-model="item.newAlias" class="form-control form-control-sm" />
                      </th>
                      <td>
                        <input type="url" required="required" v-model="item.target" class="form-control form-control-sm" />
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button type="button" class="btn btn-outline-secondary" v-on:click="updateAlias(item)">Update</button>
                          <button type="button" class="btn btn-danger" v-on:click="removeAlias(item)">Remove</button>
                        </div>
                      </td>
                    </tr>
                  </template>
                  <tr v-else>
                    <td colspan="3">
                      <div class="text-center text-muted">There's no active alias yet.</div>
                    </td>
                  </tr>
                  <tr>
                    <th>
                      <input type="text" required="required" v-model="newAlias.alias" class="form-control form-control-sm" />
                    </th>
                    <td>
                      <input type="url" required="required" v-model="newAlias.target" class="form-control form-control-sm" />
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button type="button" class="btn btn-primary" v-on:click="addAlias()">Add Alias</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"
      integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="
      crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.1/jquery.validate.min.js"
      integrity="sha256-sPB0F50YUDK0otDnsfNHawYmA5M0pjjUf4TvRJkGFrI="
      crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validation-unobtrusive/3.2.11/jquery.validate.unobtrusive.min.js"
      integrity="sha256-9GycpJnliUjJDVDqP0UEu/bsm9U+3dnQUH8+3W10vkY="
      crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"
      integrity="sha256-x3YZWtRjM8bJqf48dFAv/qmgL68SI4jqNWeSLMZaMGA="
      crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.min.js"
      integrity="sha256-WqU1JavFxSAMcLP2WIOI+GB2zWmShMI82mTpLDcqFUg="
      crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/vue/2.6.10/vue.min.js"
      integrity="sha256-chlNFSVx3TdcQ2Xlw7SvnbLAavAQLO0Y/LBiWX04viY="
      crossorigin="anonymous"></script>
  <script>
    function updateQueryProcessLabel(item) {
      item.queryProcess = item.queryProcess !== 0;
    }
    var rootVue = new Vue({
      el: '#root',
      data: {
        globalSetting: {
          defaultTarget: {
            target: null,
            permanent: false,
            queryProcess: false,
            queryProcessLabel: null
          },
          globalManagementKey: null,
          globalManagementEnabledHosts: []
        },
        messages: [],
        newHostName: location.host,
        aliases: [],
        newAlias: {
          alias: null,
          target: null
        },
        domains: [],
        newDomain: location.host
      },
      methods: {
        getGlobalSetting() {
          $.get('?verb=GetGlobalSetting',
            function (data) {
              updateQueryProcessLabel(data.defaultTarget);
              rootVue.globalSetting = data;
            });
        },
        updateGlobalDefaultTarget() {
          $.get({
            url: '?verb=UpdateGlobalDefaultTarget',
            data: this.globalSetting.defaultTarget
          })
            .then(function () {
              alert('The default target has been updated.');
            })
            .fail(function (xhr) {
              switch (xhr.status) {
                default:
                  alert(
                    'Error occured during this operation. Please try again later or contact administrators.');
                  break;
              }
            });
        },
        updateGlobalManagementKey() {
          var data = {
            key: this.globalSetting.globalManagementKey
          };
          $.get({
            url: '?verb=UpdateGlobalManagementKey',
            data: data
          }).then(function (newKey) {
            alert(
              'The global management key has been updated. Now you will be redirected to the new location.');
            window.location.href = '/' + newKey;
          }).fail(function (xhr) {
            alert(
              'Error occurred during this operation. Please try again later or contact administrators.');
          });
        },
        addHost() {
          var data = {
            hostName: this.newHostName
          };
          $.get({
            url: '?verb=AddGlobalManagementEnabledHost',
            data: data
          })
            .done(function () {
              rootVue.globalSetting.globalManagementEnabledHosts.push(data.hostName);
              alert('The host has been added.');
            })
            .fail(function (xhr) {
              switch (xhr.status) {
                case 406:
                  alert('You must first add the current host in order to add any others.');
                  break;
                case 409:
                  alert(
                    'This domain name has already been added to the list. Note: Domain names are case insensitive.');
                  break;
                default:
                  alert(
                    'Error occurred during this operation. Please try again later or contact administrators.');
                  break;
              }
            });
        },
        deleteHost(host) {
          var data = {
            hostName: host
          };
          $.get({
            url: '?verb=RemoveGlobalManagementEnabledHost',
            data: data
          })
            .done(function () {
              var index = rootVue.globalSetting.globalManagementEnabledHosts.indexOf(host);
              rootVue.globalSetting.globalManagementEnabledHosts.splice(index, 1);
              alert('The host has been removed.');
            })
            .fail(function (xhr) {
              switch (xhr.status) {
                case 406:
                  alert('You must remove all other hosts before remove the current one.');
                  break;
                case 410:
                  alert(
                    'This domain name does not exists, or has been removed already. Please try to refresh this page.');
                  break;
                default:
                  alert(
                    'Error occurred during this operation. Please try again later or contact administrators.');
                  break;
              }
            });
        },
        getAlias() {
          $.get('?verb=GetAliases').done(function (data) {
            $.each(data,
              function (index, value) {
                value.newAlias = value.alias;
              });
            rootVue.aliases = data;
          });
        },
        updateAlias(item) {
          $.get({
            url: '?verb=UpdateAlias',
            data: item
          }).done(function () {
            alert('The alias has been updated.');
            rootVue.getAlias();
          }).fail(function (xhr) {
            switch ((xhr.status)) {
              case 410:
                alert('The domain specified cannot be found. ');
                rootVue.getAlias();
                break;
              case 409:
                alert('The domain specified already exists in domains or aliases.');
                break;
              default:
                alert(
                  'Error occurred during this operation. Please try again later or contact administrators.');
                break;
            }
          });
        },
        removeAlias(item) {
          $.get({
            url: '?verb=RemoveAlias',
            data: {
              alias: item.alias
            }
          }).done(function () {
            var index = rootVue.aliases.indexOf(item);
            rootVue.aliases.splice(index, 1);
            alert('The alias has been removed.');
          }).fail(function (xhr) {
            switch ((xhr.status)) {
              case 410:
                alert('The domain specified cannot be found. ');
                rootVue.getAlias();
                break;
              default:
                alert(
                  'Error occurred during this operation. Please try again later or contact administrators.');
                break;
            }
          });
        },
        addAlias() {
          var data = this.newAlias;
          if (!data.alias || !data.target) {
            alert('You must provide both alias name and domain to add a new alias.');
            return;
          }
          $.get({
            url: '?verb=AddAlias',
            data: data
          }).done(function (data) {
            data.newAlias = data.alias;
            rootVue.aliases.push(data);
            rootVue.newAlias = { alias: null, target: null };
            alert('The alias has been added.');
          }).fail(function (xhr) {
            switch ((xhr.status)) {
              case 409:
                alert('The domain specified already exists in domains or aliases.');
                break;
              default:
                alert(
                  'Error occurred during this operation. Please try again later or contact administrators.');
                break;
            }
          });
        },
        getDomains() {
          $.get('?verb=GetDomains').done(function (data) {
            rootVue.domains = data;
          });
        },
        addDomain() {
          $.get({
            url: '?verb=AddDomain',
            data: {
              domainName: this.newDomain
            }
          }).done(function (data) {
            rootVue.domains.push(data);
            rootVue.newDomain = location.host;
            alert('The domain has been added.');
          }).fail(function (xhr) {
            switch (xhr.status) {
              case 409:
                alert('The domain specified already exists in domains or aliases.');
                break;
              default:
                alert(
                  'Error occurred during this operation. Please try again later or contact administrators.');
                break;
            }
          });
        },
        manageDomain(domain) {
          window.open(location.protocol + '//' + domain.domainName + '/' + domain.managementKey, 'Management');
        },
        removeDomain(domain) {
          if (!confirm('Do you really want to remove this domain? This action cannot be undone.')) {
            return;
          }
          $.get({
            url: '?verb=RemoveDomain',
            data: {
              domainName: domain.domainName
            }
          }).done(function () {
            var index = rootVue.domains.indexOf(domain);
            rootVue.domains.splice(index, 1);
            alert('The domain has been removed.');
          }).fail(function (xhr) {
            switch (xhr.status) {
              case 410:
                if (confirm(
                  'The domain specified cannot be found. Please refresh this page. Do you want to refresh it now?')
                ) {
                  rootVue.getDomains();
                }
                break;
              default:
                alert(
                  'Error occurred during this operation. Please try again later or contact administrators.');
                break;
            }
          });
        }
      },
      created() {
        this.getGlobalSetting();
        this.getAlias();
        this.getDomains();
      }
    });
  </script>
</body>
</html>`, { status: 200, headers: { "Content-Type": "text/html" } });
  }
}
__name(GlobalManagementProcess, "GlobalManagementProcess");
async function DomainManagementProcess(request, url, queryParams, currentDomain, env) {
  switch (queryParams.get("verb")) {
    case "GetDomainSetting": {
      let entity = {
        defaultTarget: {
          target: currentDomain.DefaultTarget,
          permanent: currentDomain.IsDefaultTargetPermanent == 1,
          queryProcess: currentDomain.DefaultTargetQueryProcess
        },
        managementKey: currentDomain.ManagementKey,
        ignoreCaseWhenMatching: currentDomain.IgnoreCaseWhenMatching
      };
      return new Response(JSON.stringify(entity), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    case "GetRedirects": {
      let query = await ReadDomainRedirects(env, currentDomain.DomainLower);
      let entity = query.map((record) => ({ address: record.Source, target: record.Target, permanent: record.IsPermanent == 1, queryProcess: record.QueryProcess }));
      return new Response(JSON.stringify(entity), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    case "UpdateDomainDefaultTarget": {
      currentDomain.DefaultTarget = queryParams.get("target");
      currentDomain.IsDefaultTargetPermanent = queryParams.get("permanent") == "true" ? 1 : 0;
      if (queryParams.get("queryProcess") == "true") {
        currentDomain.DefaultTargetQueryProcess = currentDomain.DefaultTarget.includes("?") ? 2 : 1;
      } else {
        currentDomain.DefaultTargetQueryProcess = 0;
      }
      await SaveDomainDefaultTarget(env, currentDomain.DomainLower, currentDomain.DefaultTarget, currentDomain.IsDefaultTargetPermanent, currentDomain.DefaultTargetQueryProcess);
      let entity = {
        target: currentDomain.DefaultTarget,
        permanent: currentDomain.IsDefaultTargetPermanent == 1,
        queryProcess: currentDomain.DefaultTargetQueryProcess
      };
      return new Response(JSON.stringify(entity), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    case "UpdateDomainManagementKey": {
      let newKey = queryParams.get("key");
      if (newKey) {
        if (newKey == currentDomain.ManagementKey) return new Response(null, { status: 204 });
        currentDomain.ManagementKey = newKey;
        await SaveDomainManagementKey(env, currentDomain.DomainLower, currentDomain.ManagementKey);
        return new Response(currentDomain.ManagementKey, {
          status: 200,
          headers: {
            "Content-Type": "text/plain"
          }
        });
      } else return new Response(null, { status: 406 });
    }
    case "UpdateIgnoreCaseWhenMatching": {
      let ignoreCase = queryParams.get("ignoreCase") == "true" ? 1 : 0;
      if (ignoreCase == currentDomain.IgnoreCaseWhenMatching) return new Response(null, { status: 204 });
      currentDomain.IgnoreCaseWhenMatching = ignoreCase;
      await SaveDomainIgnoreCaseWhenMatching(env, currentDomain.DomainLower, currentDomain.IgnoreCaseWhenMatching);
      if (ignoreCase == 1) {
        if (await TurnDomainRedirectToCaseInsensitive(env, currentDomain.DomainLower)) return new Response(null, { status: 205 });
        else return new Response(null, { status: 204 });
      } else {
        await TurnDomainRedirectToCaseSensitive(env, currentDomain.DomainLower);
        return new Response(null, { status: 204 });
      }
    }
    case "AddRedirect": {
      let address = queryParams.get("address");
      let target = queryParams.get("target");
      if (address && target) {
        if (address === "") return new Response(null, { status: 406 });
        let permanent = queryParams.get("permanent") == "true" ? 1 : 0;
        var queryProcess;
        if (queryParams.get("queryProcess") == "true") {
          queryProcess = target.includes("?") ? 2 : 1;
        } else {
          queryProcess = 0;
        }
        let domainRedirect = {
          DomainLower: currentDomain.DomainLower,
          SourceForMatching: currentDomain.IgnoreCaseWhenMatching ? address.toLowerCase() : address,
          Source: address,
          Target: target,
          IsPermanent: permanent,
          QueryProcess: queryProcess
        };
        if (await CreateDomainRedirect(env, domainRedirect)) {
          let entity = {
            address,
            target,
            permanent: permanent == 1,
            queryProcess
          };
          return new Response(JSON.stringify(entity), {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          });
        } else return new Response(null, { status: 409 });
      } else return new Response(null, { status: 406 });
    }
    case "RemoveRedirect": {
      let address = queryParams.get("address");
      if (address) {
        const sourceForMatching = currentDomain.IgnoreCaseWhenMatching ? address.toLowerCase() : address;
        if (await RemoveDomainRedirect(env, currentDomain.DomainLower, sourceForMatching)) return new Response(null, { status: 204 });
        else return new Response(null, { status: 410 });
      }
    }
    case "UpdateRedirect": {
      let address = queryParams.get("address");
      let newAddress = queryParams.get("newAddress");
      let target = queryParams.get("target");
      if (address && newAddress && target) {
        if (newAddress === "") return new Response(null, { status: 406 });
        let permanent = queryParams.get("permanent") == "true" ? 1 : 0;
        var queryProcess;
        if (queryParams.get("queryProcess") == "true") {
          queryProcess = target.includes("?") ? 2 : 1;
        } else {
          queryProcess = 0;
        }
        let domainRedirect = {
          DomainLower: currentDomain.DomainLower,
          SourceForMatching: currentDomain.IgnoreCaseWhenMatching ? newAddress.toLowerCase() : newAddress,
          Source: newAddress,
          Target: target,
          IsPermanent: permanent,
          QueryProcess: queryProcess
        };
        const oldKey = currentDomain.IgnoreCaseWhenMatching ? address.toLowerCase() : address;
        const result = await UpdateDomainRedirect(env, domainRedirect, oldKey);
        if (result == 1) {
          let entity = {
            address,
            target,
            permanent: permanent == 1,
            queryProcess
          };
          return new Response(JSON.stringify(entity), {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          });
        } else if (result == 0) return new Response(null, { status: 410 });
        else return new Response(null, { status: 409 });
      } else return new Response(null, { status: 406 });
    }
    default:
      return new Response(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
  <title>Domain Management</title>
  <link rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css"
      integrity="sha256-+N4/V/SbAFiW1MPBCXnfnP9QSN3+Keu+NlB+0ev/YKQ="
      crossorigin="anonymous" />
  <link rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.min.css"
      integrity="sha256-L/W5Wfqfa0sdBNIKN9cG6QA5F2qx4qICmU2VgLruv9Y="
      crossorigin="anonymous" />
</head>
<body>
  <div id="root">
    <div class="container">
      <main class="mt-3">
        <h1 class="text-center lead">Domain Management</h1>
        <hr />
        <div class="card">
          <div class="card-header" id="domain-setting-head">
            <a href="#" data-toggle="collapse" data-target="#domain-setting-body" aria-expanded="true" aria-controls="domain-setting-head">Domain Setting</a>
          </div>
          <div id="domain-setting-body" class="collapse show" aria-labelledby="domain-setting-head">
            <div class="card-body">
              <div class="accordion" id="domain-setting-accordion">
                <div class="card">
                  <div class="card-header" id="default-redirect-target-head">
                    <a href="#" data-toggle="collapse" data-target="#default-redirect-target-body" aria-expanded="true" aria-controls="default-redirect-target-head">Default Redirect Target</a>
                  </div>
                  <div id="default-redirect-target-body" class="collapse show" aria-labelledby="default-redirect-target-head" data-parent="#domain-setting-accordion">
                    <div class="card-body">
                      <p class="card-text">All unmatched requests with this domain name will be redirected to this address specified.</p>
                      <div class="form-group">
                        <label>Target</label>
                        <input class="form-control" type="url" v-model="domainSetting.defaultTarget.target" />
                        <small class="form-text text-muted">The address to be redirected to.</small>
                      </div>
                      <div class="form-group">
                        <div class="form-check">
                          <label class="form-check-label">
                            <input type="checkbox" class="form-check-input" v-model="domainSetting.defaultTarget.permanent" />
                            Use HTTP 308 instead of 307
                          </label>
                        </div>
                        <small class="form-text text-muted">Redirect with HTTP 308 will be cached by browser.</small>
                      </div>
                      <div class="form-group">
                        <div class="form-check">
                          <label class="form-check-label">
                            <input type="checkbox" class="form-check-input" v-model="domainSetting.defaultTarget.queryProcess" /> Attach Query String
                          </label>
                        </div>
                        <small class="form-text text-muted">Attach query string to the target.</small>
                      </div>
                      <hr />
                      <button type="button" class="btn btn-outline-secondary" v-on:click="updateDomainDefaultTarget()">Update</button>
                    </div>
                  </div>
                </div>
                <div class="card">
                  <div class="card-header" id="domain-management-key-head">
                    <a href="#" data-toggle="collapse" data-target="#domain-management-key-body" aria-expanded="true" aria-controls="domain-management-key-head">Domain Management Key</a>
                  </div>
                  <div id="domain-management-key-body" class="collapse" aria-labelledby="domain-management-key-head" data-parent="#domain-setting-accordion">
                    <div class="card-body">
                      <input type="text" v-model="domainSetting.managementKey" class="form-control" />
                      <small class="form-text text-muted">Navigate to this page when using this setting as path segment.</small>
                      <hr />
                      <button type="button" class="btn btn-outline-secondary" v-on:click="updateDomainManagementKey()">Update</button>
                    </div>
                  </div>
                </div>
                <div class="card">
                  <div class="card-header" id="ignore-case-head">
                    <a href="#" data-toggle="collapse" data-target="#ignore-case-body" aria-expanded="true" aria-controls="ignore-case-head">Ignore Case When Matching</a>
                  </div>
                  <div id="ignore-case-body" class="collapse" aria-labelledby="ignore-case-head" data-parent="#domain-setting-accordion">
                    <div class="card-body">
                      <div class="form-group">
                        <div class="form-check">
                          <label class="form-check-label">
                            <input type="checkbox" class="form-check-input" v-model="domainSetting.ignoreCaseWhenMatching" />
                            Ignore Case When Matching
                          </label>
                        </div>
                        <div class="text-muted form-text">When enabled, address matching will no longer consider upper and lower case differences.</div>
                      </div>
                      <hr />
                      <button type="button" class="btn btn-outline-secondary" v-on:click="updateIgnoreCase()">Update</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card mt-3">
          <div class="card-header" id="redirects-head">
            <a href="#" data-toggle="collapse" data-target="#redirects-body" aria-expanded="true" aria-controls="redirects-head">Redirects</a>
          </div>
          <div id="redirects-body" class="collapse show" aria-labelledby="redirects-head">
            <div class="card-body">
              <p class="card-text">Navigating from host which equals alias column of this table will be treated as to the host specified in target column of the same record.</p>
              <table class="table table-stripped">
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>Target</th>
                    <th>Permanent</th>
                    <th>Query String</th>
                    <th>Management</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="redirects && redirects.length !== 0">
                    <tr v-for="item in redirects">
                      <th>
                        <input type="text" required="required" v-model="item.newAddress" class="form-control form-control-sm" />
                      </th>
                      <td>
                        <input type="url" required="required" v-model="item.target" class="form-control form-control-sm" />
                      </td>
                      <td>
                        <div class="form-check form-check-inline">
                          <label class="form-check-label">
                            <input class="form-check-input" type="checkbox" v-model="item.permanent" /> Use HTTP 308
                          </label>
                        </div>
                      </td>
                      <td>
                        <div class="form-check form-check-inline">
                          <label class="form-check-label">
                            <input class="form-check-input" type="checkbox" v-model="item.queryProcess" /> Attach
                          </label>
                        </div>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button type="button" class="btn btn-outline-secondary" v-on:click="tryRedirect(item)">Try It</button>
                          <button type="button" class="btn btn-outline-secondary" v-on:click="updateRedirect(item)">Update</button>
                          <button type="button" class="btn btn-danger" v-on:click="removeRedirect(item)">Remove</button>
                        </div>
                      </td>
                    </tr>
                  </template>
                  <tr v-else>
                    <td colspan="5">
                      <div class="text-center text-muted">There's no active redirects yet.</div>
                    </td>
                  </tr>
                  <tr>
                    <th>
                      <input type="text" required="required" v-model="newRedirect.address" class="form-control form-control-sm" />
                    </th>
                    <td>
                      <input type="url" required="required" v-model="newRedirect.target" class="form-control form-control-sm" />
                    </td>
                    <td>
                      <div class="form-check form-check-inline">
                        <label class="form-check-label">
                          <input class="form-check-input" type="checkbox" v-model="newRedirect.permanent" /> Use HTTP 308
                        </label>
                      </div>
                    </td>
                    <td>
                      <div class="form-check form-check-inline">
                        <label class="form-check-label">
                          <input class="form-check-input" type="checkbox" v-model="newRedirect.queryProcess" /> Attach
                        </label>
                      </div>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button type="button" class="btn btn-primary" v-on:click="addRedirect()">Add Redirect</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"
      integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="
      crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.1/jquery.validate.min.js"
      integrity="sha256-sPB0F50YUDK0otDnsfNHawYmA5M0pjjUf4TvRJkGFrI="
      crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validation-unobtrusive/3.2.11/jquery.validate.unobtrusive.min.js"
      integrity="sha256-9GycpJnliUjJDVDqP0UEu/bsm9U+3dnQUH8+3W10vkY="
      crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"
      integrity="sha256-x3YZWtRjM8bJqf48dFAv/qmgL68SI4jqNWeSLMZaMGA="
      crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.min.js"
      integrity="sha256-WqU1JavFxSAMcLP2WIOI+GB2zWmShMI82mTpLDcqFUg="
      crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/vue/2.6.10/vue.min.js"
      integrity="sha256-chlNFSVx3TdcQ2Xlw7SvnbLAavAQLO0Y/LBiWX04viY="
      crossorigin="anonymous"></script>
  <script>
    function updateQueryProcessLabel(item) {
      item.queryProcess = item.queryProcess !== 0;
    }
    var rootVue = new Vue({
      el: '#root',
      data: {
        domainSetting: {
          defaultTarget: {
            target: null,
            permanent: false,
            queryProcess: false
          },
          managementKey: null,
          ignoreCaseWhenMatching: false
        },
        redirects: [],
        newRedirect: {
          address: null,
          target: null,
          permanent: false,
          queryProcess: false
        }
      },
      computed: {
        isAttached: {
          get() {
            return this.domainSetting.defaultTarget.queryProcess !== 0;
          },
          set(value) {
            if (value) {
              this.domainSetting.defaultTarget.queryProcess = 1;
            } else {
              this.domainSetting.defaultTarget.queryProcess = 0;
            }
          }
        }
      },
      methods: {
        getDomainSetting() {
          $.get('?verb=GetDomainSetting',
            function (data) {
              updateQueryProcessLabel(data.defaultTarget);
              rootVue.domainSetting = data;
            });
        },
        updateDomainDefaultTarget() {
          $.get({
            url: '?verb=UpdateDomainDefaultTarget',
            data: this.domainSetting.defaultTarget
          })
            .then(function () {
              alert('The domain default target has been updated.');
            })
            .fail(function (xhr) {
              alert(
                'Error occurred during this operation. Please try again later or contact administrators.');
            });

        },
        updateIgnoreCase() {
          var data = {
            ignoreCase: this.domainSetting.ignoreCaseWhenMatching
          };
          $.get({
            url: '?verb=UpdateIgnoreCaseWhenMatching',
            data: data
          })
            .then(function () {
              alert('The ignore case setting has been updated.');
              rootVue.getRedirects();
            })
            .fail(function (xhr) {
              alert(
                'Error occurred during this operation. Please try again later or contact administrators.');
            });
        },
        updateDomainManagementKey() {
          var data = {
            key: this.domainSetting.managementKey
          };
          $.get({
            url: '?verb=UpdateDomainManagementKey',
            data: data
          })
            .then(function (newKey) {
              alert('The domain management key has been updated. Now you will be redirected to the new location.');
              window.location.href = '/' + newKey;
            })
            .fail(function (xhr) {
              alert(
                'Error occurred during this operation. Please try again later or contact administrators.');
            });
        },
        getRedirects() {
          $.get('?verb=GetRedirects',
            function (data) {
              $.each(data,
                function (index, value) {
                  updateQueryProcessLabel(value);
                  value.newAddress = value.address;
                });
              rootVue.redirects = data;
            });
        },
        tryRedirect(item) {
          window.open('/' + item.address, '_blank');
        },
        updateRedirect(item) {
          var data = item;
          $.get({
            url: '?verb=UpdateRedirect',
            data: data
          }).done(function () {
              item.address = item.newAddress;
              alert('The redirect has been updated.');
          })
            .fail(function (xhr) {
              switch (xhr.status) {
                case 410:
                  if (confirm('The domain specified cannot be found. Please refresh this page. Do you want to refresh it now?')) {
                    rootVue.getRedirects();;
                  }
                  break;
                case 409:
                  alert('The domain specified already exists in domains or aliases.');
                  break;
                case 406:
                  alert('Address cannot be set to empty string or space only.');
                  break;
                default:
                  alert(
                    'Error occurred during this operation. Please try again later or contact administrators.');
                  break;
              }
            });
        },
        addRedirect() {
          $.get({
            url: '?verb=AddRedirect',
            data: this.newRedirect
          }).done(function (data) {
            alert('The redirect has been added.');
            data.newAddress = data.address;
            rootVue.redirects.push(data);
            rootVue.newRedirect = {
              address: null,
              target: null,
              permanent: false,
              queryProcess: false
            };
          }).fail(function (xhr) {
            switch (xhr.status) {
              case 409:
                alert('A record with the same address specified already exists.');
                break;
              case 406:
                alert('Address cannot be set to empty string or space only.');
                break;
              default:
                alert(
                  'Error occurred during this operation. Please try again later or contact administrators.');
                break;
            }
          });
        },
        removeRedirect(item) {
          $.get({
            url: '?verb=RemoveRedirect',
            data: {
              address: item.address
            }
          }).done(function () {
            alert('The redirect has been removed.');
            var index = rootVue.redirects.indexOf(item);
            rootVue.redirects.splice(index, 1);
          }).fail(function (xhr) {
            switch (xhr.status) {
              case 410:
                if (confirm('The domain specified cannot be found. Please refresh this page. Do you want to refresh it now?')) {
                  rootVue.getRedirects();;
                }
                break;
              default:
                alert(
                  'Error occurred during this operation. Please try again later or contact administrators.');
                break;
            }
          });
        }
      },
      created() {
        this.getDomainSetting();
        this.getRedirects();
      }
    });
  </script>
</body>
</html>`, { status: 200, headers: { "Content-Type": "text/html" } });
  }
}
__name(DomainManagementProcess, "DomainManagementProcess");
function Redirect(target, isPermanent, queryProcess, url) {
  if (target.startsWith('"')) {
    let secondQuoteIndex = target.indexOf('"', 1);
    if (secondQuoteIndex !== -1) {
      let contentType = target.substring(1, secondQuoteIndex);
      let text = target.substring(secondQuoteIndex + 1);
      if (text !== "") {
        return new Response(text, {
          status: 200,
          headers: {
            "Content-Type": contentType
          }
        });
      }
    }
  } else if (target.startsWith("<")) {
    let text = target.substring(1);
    if (text !== "") {
      return new Response(text, {
        status: 200,
        headers: {
          "Content-Type": "text/plain;charset=UTF-8"
        }
      });
    }
  } else {
    var finalTarget;
    let queryString = url.search;
    if (queryString !== "") {
      if (queryProcess == 1) {
        finalTarget = target + queryString;
      } else if (queryProcess == 2) {
        finalTarget = target + "&" + queryString.substring(1);
      } else {
        finalTarget = target;
      }
    } else {
      finalTarget = target;
    }
    return new Response(null, {
      status: isPermanent == 1 ? 308 : 307,
      headers: {
        "Location": finalTarget
      }
    });
  }
  return null;
}
__name(Redirect, "Redirect");
var index_default = {
  async fetch(request, env, ctx) {
    const maxRedirectLimit = 16;
    const globalSetting = await ReadGlobalSetting(env);
    var currentDomain;
    const url = new URL(request.url);
    let host = url.host;
    let hostLower = host.toLowerCase();
    const address = url.pathname.substring(1);
    if (address === globalSetting.GlobalManagementKey) {
      var globalManagementEnabledHosts;
      var noManagementEnabledHosts;
      if (globalSetting.GlobalManagementEnabledHosts == "") {
        globalManagementEnabledHosts = [];
        noManagementEnabledHosts = true;
      } else {
        globalManagementEnabledHosts = globalSetting.GlobalManagementEnabledHosts.split(",").map((item) => item.trim()).filter((item) => item != "");
        noManagementEnabledHosts = globalManagementEnabledHosts.length == 0;
      }
      if (noManagementEnabledHosts || globalManagementEnabledHosts.some((item) => item.toLowerCase() === hostLower)) {
        return await GlobalManagementProcess(request, url, host, url.searchParams, globalManagementEnabledHosts, globalSetting, env);
      }
    }
    let leftRedirect = maxRedirectLimit;
    while (true) {
      let CurrentAlias = await GetDomainAlias(env, hostLower);
      if (CurrentAlias === null) break;
      if (leftRedirect == 0) {
        currentDomain = null;
        break;
      }
      leftRedirect--;
      host = CurrentAlias.TargetDomain;
      hostLower = CurrentAlias.TargetDomainLower;
    }
    currentDomain = await GetDomainSetting(env, hostLower);
    var response;
    if (currentDomain) {
      if (address === currentDomain.ManagementKey) {
        return await DomainManagementProcess(request, url, url.searchParams, currentDomain, env);
      }
      var matcher;
      if (currentDomain.IgnoreCaseWhenMatching == 1) matcher = address.toLowerCase();
      else matcher = address;
      leftRedirect = maxRedirectLimit;
      let record = await GetDomainRedirect(env, hostLower, matcher);
      while (record && record.Target.startsWith(">")) {
        let leftPart = record.Target.substring(1);
        if (currentDomain.IgnoreCaseWhenMatching == 1) matcher = leftPart.toLowerCase();
        else matcher = leftPart;
        record = await GetDomainRedirect(env, hostLower, matcher);
        if (record === null) break;
        if (leftRedirect == 0) {
          record = null;
          break;
        }
        leftRedirect--;
      }
      if (record) {
        response = Redirect(record.Target, record.IsPermanent, record.QueryProcess, url);
        if (response) return response;
      }
      response = Redirect(currentDomain.DefaultTarget, currentDomain.IsDefaultTargetPermanent, currentDomain.DefaultTargetQueryProcess, url);
      if (response) return response;
    }
    return Redirect(globalSetting.DefaultTarget ?? "https://secretnest.info", globalSetting.IsDefaultTargetPermanent, globalSetting.DefaultTargetQueryProcess, url);
  }
};
export {
  index_default as default
};
