> **CAUTION:** This project is under development. The README would be updated with the relevant documentations once I release the first production version (v1).

# Terraform Version Manager

[![npm version](https://img.shields.io/npm/v/tfvm?color=blue&label=version&style=flat-square)](https://www.npmjs.com/package/tfvm) [![downloads per week](https://img.shields.io/npm/dw/tfvm)](https://www.npmjs.com/package/tfvm) [![license](https://img.shields.io/npm/l/tfvm?color=lightblue)](https://www.npmjs.com/package/tfvm)

<br />

### A NodeJS-based CLI tool to manage terraform versions on a system

Install it globally to manage all the terraform versions

```sh
$ npm install -g tfvm
```

![](https://github.com/anindya-dey/tfvm/blob/main/assets/gifs/tfvm.gif)

### Available Commands

#### `list | ls [--remote | -r]`

- Use this command to list the downloaded versions of terraform

  ```sh
  $ tfvm list # gets all the locally available terraform executables
  ```

- Append `--remote` or `-r` with `list` to get a list of all available releases from [Terraform](https://releases.hashicorp.com/terraform)

  ```sh
  $ tfvm list --remote # displays the available releases from Terraform's website

  # --- OR ---

  $ tfvm ls -r
  ```

  ![](https://github.com/anindya-dey/tfvm/blob/main/assets/gifs/tfvm-ls-remote.gif)

- If you do not have any terraform executables on your path, you would see an error, like so:
  ![](https://github.com/anindya-dey/tfvm/blob/main/assets/gifs/tfvm-ls-when-empty.gif)

<br />

#### `download | d [version]`

- This will present a list of available versions, and then a list of releases available for that version from terraform. Choose one with up/down arrow and hit `ENTER` to download it.

  ```sh
  $ tfvm download
  ```

- Optionally, a `version` can be appended to this command which would directly present a list of releases, associated to this version:

  ```sh
  $ tfvm download 1.1.0
  ```

<br />

#### `remove | rm [--all | -a]`

- Use this to remove/delete a particular terraform executable or all terraform executables.

  ```sh
  $ tfvm remove # to remove a particular terraform executable
  ```

- Use `--all` or `-a` option to remove all the terraform executables.

  ```sh
  $ tfvm remove --all # to remove all the terraform executables
  ```

<br />

#### `use`

- This command will present a list of all the locally available terraform executables. Once a particular executable is selected, it would be set as default and made available to the user via the `terraform` commands in the terminal.

  ```sh
  $ tfvm use # select a terraform executable as default, which can be used via 'terraform' command
  ```

> NOTE: User might have to perform a one-time update of their PATH variable to include the path indicated by this command.

<br />

#### `dir`

- This command shows the directory where all the terraform executables are stored locally. The default path is the `$USER/terraform` directory.

  ```sh
  $ tfvm dir # shows the directory where all the terraform executables are stored
  ```

<br />

> **NOTES:**
>
> 1. Currently, platform specfic releases are not filtered out when executing `tfvm list --remote` or `tfvm download [version]` command. User needs to make sure that they are downloaing the right release for their system.

---

:heart: _This project is inspired by the [nvm project](https://github.com/nvm-sh/nvm)_ :pray:
