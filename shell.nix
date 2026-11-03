# Build shell for the Mak'gora client on NixOS. Rust comes from rustup's
# pinned toolchain (src-tauri/rust-toolchain.toml) through the rustup proxy
# that this shell puts on PATH; Bun from the user profile.
{ pkgs ? import <nixpkgs> { } }:
let runtime = import ./runtime.nix { inherit pkgs; };
in pkgs.mkShell {
  nativeBuildInputs = with pkgs; [ pkg-config stdenv.cc rustup ];
  buildInputs = runtime.paths ++ (map (p: p.dev or p) runtime.paths);
  # The tray library is loaded at run time.
  LD_LIBRARY_PATH = "${runtime}/lib";
  # nix-shell deletes its TMPDIR on exit; an sccache server started inside it would keep the dead path and fail every later build.
  shellHook = ''
    export TMPDIR="''${XDG_RUNTIME_DIR:-/tmp}"
    if command -v north >/dev/null; then north target-seed || true; fi
  '';
}
