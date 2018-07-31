#!/bin/bash
AF_REPO_FOR_ES="https://sfy-metriks-registry-prod.af.multis.p.fti.net/sfy-idem_generic_estack/kibana/plugins"

RELEASE="6.3.2"
USE_LOCAL_BUILD="TRUE"

PLUGINS=(
 #"kibana-xlsx-import"  "xlsx-import-${RELEASE}-latest.zip"      "https://github.com/kyushy/kibana-xlsx-import/releases/download/${RELEASE}/xlsx-import-${RELEASE}-latest.zip"
 "kibana-xlsx-import"  "xlsx-import-${RELEASE}-latest.zip"      "./build/xlsx-import-${RELEASE}-latest.zip"
)


if [[ -z "$USER" ]]
then
    echo "*** Error: variable USER is not set." >&2
    exit 1
fi

echo -n LDAP Password:
read -s password
echo

function download() {
  [[ ! -d .downloads ]] && mkdir .downloads
  for index in $(seq 0 3 $(( ${#PLUGINS[@]} - 3 ))); do
    if [[ "${PLUGINS[$(( $index + 2 ))]}" != "" ]]; then
      [[ -f ".downloads/${PLUGINS[$(( $index + 1 ))]}" ]] || curl -L -o ".downloads/${PLUGINS[$(( $index + 1 ))]}" "${PLUGINS[$(( $index + 2 ))]}"
    else
      echo "WARNING: No Url for downloading plugin '${PLUGINS[$index]}'."
    fi
  done
}

function upload() {
  for index in $(seq 0 3 $(( ${#PLUGINS[@]} - 3 ))); do
    if [[ -f ".downloads/${PLUGINS[$(( $index + 1 ))]}" ]]; then
      curl -kL -u "${USER}:${password}" -T ".downloads/${PLUGINS[$(( $index + 1 ))]}" "${AF_REPO_FOR_ES}/${PLUGINS[$index]}/${PLUGINS[$(( $index + 1 ))]}"
    else
      echo "WARNING: Plugin .downloads/${PLUGINS[$(( $index + 1 ))]} doesn't exists"
    fi
  done
}


[ USE_LOCAL_BUILD==TRUE ] && ln -s build .downloads

#download
upload

[ USE_LOCAL_BUILD==TRUE ] && rm .downloads
