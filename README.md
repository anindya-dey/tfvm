# Terraform Version Manager

### A NodeJS-based CLI tool to manage terraform versions on a system

[![npm version](https://img.shields.io/npm/v/tfvm?color=blue&label=version&style=flat-square)](https://www.npmjs.com/package/tfvm) [![downloads per week](https://img.shields.io/npm/dw/tfvm)](https://www.npmjs.com/package/tfvm) [![license](https://img.shields.io/npm/l/tfvm?color=lightblue)](https://www.npmjs.com/package/tfvm)

Install it globally to manage all the terraform versions

```sh
$ npm install -g tfvm
```

![](https://github.com/anindya-dey/tfvm/blob/main/assets/gifs/default.gif)

### Available Commands

---

#### `list | ls [--remote | -r]`

- Use this command to list the downloaded versions of terraform

  ```sh
  $ tfvm list # gets all the locally available terraform executables

  # --- OR ---

  $ tfvm ls
  ```

  ![](https://github.com/anindya-dey/tfvm/blob/main/assets/gifs/ls.gif)

- Append `--remote` or `-r` with `list` to get a list of all available releases from [Terraform](https://releases.hashicorp.com/terraform)

  ```sh
  $ tfvm list --remote # displays the available releases from Terraform's website

  # --- OR ---

  $ tfvm ls -r
  ```

  ![](https://github.com/anindya-dey/tfvm/blob/main/assets/gifs/ls-remote.gif)

- If you do not have any terraform executables on your path, you would see an error, like so:

  ![](https://github.com/anindya-dey/tfvm/blob/main/assets/gifs/ls-when-empty.gif)

---

#### `download | d [version]`

- This will present a list of available versions, and then a list of releases available for that version from terraform. Choose one with up/down arrow and hit `ENTER` to download it.

  ```sh
  $ tfvm download
  
  # --- OR ---
  
  $ tfvm d
  ```

  ![](https://github.com/anindya-dey/tfvm/blob/main/assets/gifs/download.gif)

- Optionally, a `version` can be appended to this command which would directly present a list of releases, associated to this version:

  ```sh
  $ tfvm download 1.3.1
  
  # --- OR ---
  
  $ tfvm d 1.3.1
  ```

  ![](https://github.com/anindya-dey/tfvm/blob/main/assets/gifs/download-version.gif)

---

#### `remove | rm [--all | -a]`

- Use this to remove/delete a particular terraform executable or all terraform executables.

  ```sh
  $ tfvm remove # to remove a particular terraform executable
  
  # --- OR ---
  
  $ tfvm rm
  ```
  
  ![](https://github.com/anindya-dey/tfvm/blob/main/assets/gifs/remove.gif)

- Use `--all` or `-a` option to remove all the terraform executables.

  ```sh
  $ tfvm remove --all # to remove all the terraform executables
  
  # --- OR ---
  
  $ tfvm rm -a
  ```
  
  ![](https://github.com/anindya-dey/tfvm/blob/main/assets/gifs/remove-all.gif)

---

#### `use`

- This command will present a list of all the locally available terraform executables. Once a particular executable is selected, it would be set as default and made available to the user via the `terraform` commands in the terminal.

  ```sh
  $ tfvm use # select a terraform executable as default, which can be used via 'terraform' command
  ```
  
  ![](https://github.com/anindya-dey/tfvm/blob/main/assets/gifs/use.gif)

> NOTE: User might have to perform a one-time update of their PATH variable to include the path indicated by this command.

---

#### `dir`

- This command shows the directory where all the terraform executables are stored locally. The default path is the `$USER/terraform` directory.

  ```sh
  $ tfvm dir # shows the directory where all the terraform executables are stored
  ```

  ![](https://github.com/anindya-dey/tfvm/blob/main/assets/gifs/dir.gif)

---

> **NOTES:**
>
> 1. Currently, platform specfic releases are not filtered out when executing `tfvm list --remote` or `tfvm download [version]` command. User needs to make sure that they are downloaing the right release for their system.

---

⭐ :heart: _This project is inspired by the [nvm project](https://github.com/nvm-sh/nvm)_ 😍 ⭐

⭐ :heart: _Also thanks to [terminalizer](https://www.npmjs.com/package/terminalizer) using which I have created these beautiful gifs_ 😍 ⭐
