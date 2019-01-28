# set your token
#export GITHUB_TOKEN=...

USER="Orange-OpenSource"
REPO="kibana-xlsx-import"
BUILD_VERSION="1"
SKIP_INSTALL_DEPS="false"

# get the params
while getopts b:k:u:s option
do
    case "${option}"
    in
        b) BUILD_VERSION=${OPTARG};;
        k) KIBANA_VERSION=${OPTARG};;
        u) USER=${OPTARG};;
        s) SKIP_INSTALL_DEPS="true"
    esac
done

# Check kibana version
if [ -z ${KIBANA_VERSION} ]; then 
    echo -e "Options: -k <Kibana version> (mandatory)" 
    echo -e "         -b <Build increment> (default to 1)" 
    echo -e "         -u <User to log in Github> (default to '$USER')" 
    echo -e "         -s for skip dependencies install (default install deps)" 
    exit; 
fi

TAG_NAME=${KIBANA_VERSION}-${BUILD_VERSION}
TAG_NAME_LATEST=${KIBANA_VERSION}-latest

# Install (or not) dependencies
echo
if [ "${SKIP_INSTALL_DEPS}" = "false" ]; then 
    echo "Install Kibana dependencies..."
    echo 
    yarn kbn bootstrap 
else
    echo "Skip installing Kibana dependencies..."
fi

# Build packages
echo
echo "Build Kibana plugin package..."
echo
yarn build -b ${TAG_NAME} -k ${KIBANA_VERSION}

echo
echo "Create a package copy as latest..."
echo
echo "cp build/${REPO}-${TAG_NAME}.zip build/${REPO}-${TAG_NAME_LATEST}.zip"
cp build/${REPO}-${TAG_NAME}.zip build/${REPO}-${TAG_NAME_LATEST}.zip


# Create tag and release

echo
echo "Create Git tag for the new release"
git tag -m "update to version ${KIBANA_VERSION}" ${KIBANA_VERSION} && git push --tags

# create a formal release
echo
echo "Create the release"
github-release release \
    --user ${USER} \
    --repo ${REPO} \
    --tag ${KIBANA_VERSION} \
    --name "v${KIBANA_VERSION}" \
    --description "Automatic plugin release for kibana v${KIBANA_VERSION}. " \
    --pre-release

# upload the package file
echo
echo "Upload the corresponding package file"
github-release upload \
  --user ${USER} \
  --repo ${REPO} \
  --tag  ${KIBANA_VERSION} \
  --name "${REPO}-${TAG_NAME}.zip" \
  --file build/${REPO}-${TAG_NAME}.zip

# upload the alias "latest" package file
echo
echo "Upload the corresponding package file"
github-release upload \
  --user ${USER} \
  --repo ${REPO} \
  --tag  ${KIBANA_VERSION} \
  --name "${REPO}-${TAG_NAME_LATEST}.zip" \
  --file build/${REPO}-${TAG_NAME_LATEST}.zip
