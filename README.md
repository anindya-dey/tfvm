# Terraform Version Manager

### A NodeJS-based CLI tool to manage terraform versions on a system

<br />

[![npm version](https://img.shields.io/npm/v/tfvm?color=blue&label=version&style=for-the-badge)](https://www.npmjs.com/package/tfvm) [![Total Downloads](https://img.shields.io/npm/dt/tfvm?label=total%20downloads&style=for-the-badge)](https://www.npmjs.com/package/tfvm) [![license](https://img.shields.io/npm/l/tfvm?color=lightblue&style=for-the-badge)](https://www.npmjs.com/package/tfvm)

<br />

Install it globally to manage all the terraform versions

```sh
$ npm install -g tfvm
```

![default](https://user-images.githubusercontent.com/30517208/215016872-45b400f6-5738-4404-876e-f886f6e77fdb.gif)

### Available Commands

---

#### `list | ls [--remote | -r]`

- Use this command to list the downloaded versions of terraform

  ```sh
  $ tfvm list # gets all the locally available terraform executables

  # --- OR ---

  $ tfvm ls
  ```

  ![ls](https://user-images.githubusercontent.com/30517208/215016919-d4d38647-bc18-48ce-961a-9a27f088e349.gif)

- Append `--remote` or `-r` with `list` to get a list of all available releases from [Terraform](https://releases.hashicorp.com/terraform)

  ```sh
  $ tfvm list --remote # displays the available releases from Terraform's website

  # --- OR ---

  $ tfvm ls -r
  ```

  ![ls-remote](https://user-images.githubusercontent.com/30517208/215016945-d68d2db7-f3eb-47fd-931b-4db05ee0ab7b.gif)

- If you do not have any terraform executables on your path, you would see an error, like so:

  ![ls-when-empty](https://user-images.githubusercontent.com/30517208/215017052-ddce48bc-a501-4b91-bc03-20dd430f3344.gif)

---

#### `download | d [version]`

- This will present a list of available versions, and then a list of releases available for that version from terraform. Choose one with up/down arrow and hit `ENTER` to download it.

  ```sh
  $ tfvm download

  # --- OR ---

  $ tfvm d
  ```

  ![download](https://user-images.githubusercontent.com/30517208/215017148-f18bb0a4-cf7f-45a4-9e68-b33d8d46beba.gif)

- Optionally, a `version` can be appended to this command which would directly present a list of releases, associated to this version:

  ```sh
  $ tfvm download 1.3.1

  # --- OR ---

  $ tfvm d 1.3.1
  ```

  ![download-version](https://user-images.githubusercontent.com/30517208/215017241-014aba01-a4b3-4b36-9f01-d7eb0ddf785e.gif)

---

#### `remove | rm [--all | -a]`

- Use this to remove/delete a particular terraform executable or all terraform executables.

  ```sh
  $ tfvm remove # to remove a particular terraform executable

  # --- OR ---

  $ tfvm rm
  ```

  ![remove](https://user-images.githubusercontent.com/30517208/215017300-4b4e0290-b23c-4944-b673-ce176f56bfb9.gif)

- Use `--all` or `-a` option to remove all the terraform executables.

  ```sh
  $ tfvm remove --all # to remove all the terraform executables

  # --- OR ---

  $ tfvm rm -a
  ```

  ![remove-all](https://user-images.githubusercontent.com/30517208/215017334-0bbe541a-dbcf-4059-a909-dc90d4f5ba99.gif)

---

#### `use`

- This command will present a list of all the locally available terraform executables. Once a particular executable is selected, it would be set as default and made available to the user via the `terraform` commands in the terminal.

  ```sh
  $ tfvm use # select a terraform executable as default, which can be used via 'terraform' command
  ```

  ![use](https://user-images.githubusercontent.com/30517208/215017404-dc951a39-ffc4-4161-9ffa-914a04c2589a.gif)

> NOTE: User might have to perform a one-time update of their PATH variable to include the path indicated by this command.

---

#### `dir`

- This command shows the directory where all the terraform executables are stored locally. The default path is the `$USER/terraform` directory.

  ```sh
  $ tfvm dir # shows the directory where all the terraform executables are stored
  ```

  ![dir](https://user-images.githubusercontent.com/30517208/215017477-b76626fc-bca8-4032-9c36-fa5a4a8f12b9.gif)

---

> **NOTES:**
>
> 1. Currently, platform specfic releases are not filtered out when executing `tfvm list --remote` or `tfvm download [version]` command. User needs to make sure that they are downloading the right release for their system.

---

⭐ _This project is inspired by the [nvm project](https://github.com/nvm-sh/nvm)_ 😍

⭐ _I created these beautiful gifs by using [terminalizer](https://www.npmjs.com/package/terminalizer)_ 😍
