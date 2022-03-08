> **CAUTION:** This project is under development. The README would be updated with the relevant documentations once I release the first production version (v1).

# Terraform Version Manager
### A NodeJS-based CLI tool to manage terraform versions on a system

Install it globally to manage all the terraform versions

```sh
# To install tfvm globally, run this
$ npm install -g tfvm
```
## Available commands

### `list|ls`
- Use this command to list the downloaded versions of terraform
  ```sh
  $ tfvm list # gets all the locally available terraform executables
  ```
- Options:
  - Append `-r` or `--remote` with `list` or `ls` to get a list of all available releases from [Terraform](https://releases.hashicorp.com/terraform")
    ```sh
    $ tfvm list --remote # displays the available releases from Terraform's website
    ```
### `dir`
- This command shows the directory where all the terraform executables are stored locally
- Default path is the `$USER/terraform` directory
  ```sh
  $ tfvm dir # shows the directory where all the terraform executables are stored
  ```

### `download`
- Use it to download a specific version of terraform
  ```sh
  $ tfvm download
  ```

---

:heart: _This project is inspired by the [nvm project](https://github.com/nvm-sh/nvm)_ :pray:
