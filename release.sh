# Example: bash ./release.sh 1.0.1 patch

if [ -z "$1" ]
then
    echo "🔴 Enter release version! 🚫"
    echo "🔴 Command should be in the format 'bash ./release.sh <version> <version_method (like patch, minor, major, etc)>' 🚫"
    exit 1
fi

if [ -z "$2" ]
then
    echo "🔴 Enter version method like patch, minor, major, etc! 🚫"
    echo "🔴 Command should be in the format 'bash ./release.sh <version> <version_method (like patch, minor, major, etc)>' 🚫"
    exit 1
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if [[ $BRANCH = "main" ]]
then
    echo "🟢 You are on the main branch. 👍"
else
    echo "🔴 Aborting!!! You are not on the main branch! 🚫"
    exit 1
fi

if [ -z "$(git log origin/main..HEAD)" ]
then
    echo "🟢 Your main branch does not have commits that have not been pushed. ✨"
else
    echo "🔴 Aborting!!! Your main branch has commits that have not been pushed! 🔥"
    exit 1
fi

RELEASE_BRANCH_NAME="release-v$1"

if [ -z "$(git status --porcelain)" ]
then
    echo "🟢 Your working directory is clean. 👌"
    echo "🟢 Creating new git branch $RELEASE_BRANCH_NAME... 🌵"
    git switch -c "$RELEASE_BRANCH_NAME"
    git push --set-upstream origin "$RELEASE_BRANCH_NAME"
else
    echo "🔴 Aborting!!! Your working directory is not clean! ✋"
    exit 1
fi

DESIRED_UPDATE_METHOD="patch"

if [ "$2" = "major" ] || [ "$2" = "minor" ] || [ "$2" = "patch" ] || [ "$2" = "prerelease" ]
then
    DESIRED_UPDATE_METHOD=$2
    echo "🟢 Starting $DESIRED_UPDATE_METHOD version update... 🕓"
elif [ -z "$2" ]
then
    echo "🟢 Starting $DESIRED_UPDATE_METHOD version update... 🕓"
else
    echo "🔴 Aborting!!! The second argument must be 'major', 'minor', 'patch' or 'prerelease', or left blank. [Default is 'patch'] 🩹"
    exit 1
fi

VERSION_FROM_NPM=$(npm version "$DESIRED_UPDATE_METHOD")
VERSION_FROM_NPM_WITHOUT_THE_V=${VERSION_FROM_NPM:1}

echo "Supplied Version - $1"
echo "NPM Version - $VERSION_FROM_NPM_WITHOUT_THE_V"

if [ "$1" = "$VERSION_FROM_NPM_WITHOUT_THE_V" ]
then
    git add .
    git commit -m "Release $VERSION_FROM_NPM"
    git tag "v$1"
    git push --atomic origin "$RELEASE_BRANCH_NAME"
    git push --tags
else
    echo "🔴 Aborting!!! Desired version and version from npm are different! 🙄"
    exit 1
fi
