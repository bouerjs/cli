# v0.10.0
[2026-09-26]

### Features

* feat: added bouer schema to help structuring the configuration file `bouer.json` ([`a54e191`](https://github.com/bouerjs/cli/commit/a54e191f67ea1778ca64cdfc581a783173dca4fe))
* feat: added webpack and webpack-cli to the project ([`85a80a6`](https://github.com/bouerjs/cli/commit/85a80a6e7b317e643c77bbccb7a221942465d425))
* feat: added a plugin to copy all the assets defined in the bouer config file ([`e917eb0`](https://github.com/bouerjs/cli/commit/e917eb086a0a450127d2e301b3df6db1fa2691e5))
* feat: command executor, used for perform commands selecting the right webpack.config.js to use ([`657c6da`](https://github.com/bouerjs/cli/commit/657c6dac46612f6fef14e792662756f855687f71))
* feat: added executor function in build and run commands ([`05c53da`](https://github.com/bouerjs/cli/commit/05c53daf6aa3c22bcd8e52a4a5c3bc5b15188696))
* feat: added default.bouer.json that will be generated to bouer.json when the project is created ([`7f949ab`](https://github.com/bouerjs/cli/commit/7f949aba098305fbaff29798d0b211980767d859))
* feat: added webpack.config.js file generation in create command ([`57c4db5`](https://github.com/bouerjs/cli/commit/57c4db590d33e9d6c30f5e032dbbf267107f8098))
* feat: added configuration preview in bouer create config command ([`d412f72`](https://github.com/bouerjs/cli/commit/d412f7287e5dfa96a1f4a5f43abc613a8426580c))
* feat: ajusted it to deal with current project path or provided path ([`93d428f`](https://github.com/bouerjs/cli/commit/93d428f612eabcdf27672dee85f54b01034705ae))

### Fixes

* fix: deps updated ([`670b5ab`](https://github.com/bouerjs/cli/commit/670b5abe1ef749b8f55c34c0360da67b54b27cef))
* fix: removed the element injector because is not being used anymore ([`853434b`](https://github.com/bouerjs/cli/commit/853434bae4ef757a81e0db6adf049b78ee45e6c1))
* fix: changed require function to load a file to import according to the new libs version, and added alias for build -&gt; b ([`02a34b6`](https://github.com/bouerjs/cli/commit/02a34b6b995ad6d930e9040c78217ec21c718ac6))
* fix: tsconfig updated to match the new libs version ([`5d1727c`](https://github.com/bouerjs/cli/commit/5d1727c28fde19f3cace1b439df4fe7751ed9e57))
* fix: changed require function to load a file to import according to the new libs version ([`2bbb578`](https://github.com/bouerjs/cli/commit/2bbb5786744c31165273032d3e30fbaf88420fec))
* fix: changed require function to load a file to import according to the new libs version, and added alias for install -&gt; i ([`9567ee2`](https://github.com/bouerjs/cli/commit/9567ee2e901b0877d9e3aaef8996df1f0db7473b))
* fix: changed require function to load a file to import according to the new libs version, and added alias for install -&gt; i ([`995bdfc`](https://github.com/bouerjs/cli/commit/995bdfcb8f37aa8651fa116eb6807207ad236484))
* fix: changed require function to load a file to import according to the new libs version ([`dcbf3f3`](https://github.com/bouerjs/cli/commit/dcbf3f3d47774192622bb52be95260b91ad189ff))
* fix: updated project import type ([`f9ca502`](https://github.com/bouerjs/cli/commit/f9ca502ecb5c0f39ec7d3d9020a6247eb3809a13))
* fix: added --mode in the command ([`ea28739`](https://github.com/bouerjs/cli/commit/ea287397a09372ba0d3431e14f95fb0cc114fd6c))
* fix: fixed the missing link attributes ([`101081d`](https://github.com/bouerjs/cli/commit/101081d66dd08edf0bc78787be069883180efb7e))
* fix: CLI version updated ([`e6adf55`](https://github.com/bouerjs/cli/commit/e6adf5572e435dc7a328634c334288b3c6af1bbd))
* fix: Sass loader package upgraded ([`1f87fa3`](https://github.com/bouerjs/cli/commit/1f87fa38f37dd2d98d682b8d905bc077e723bfb2))
* fix: changed require function to load a file to import according to the new libs version, and added alias for build -&gt; b ([`3a14a5f`](https://github.com/bouerjs/cli/commit/3a14a5f47ebda9d96f08e2420828c75e64d47de8))

### Breaking changes

* break: added alias to the commands and ajusted the project and components creation to match the new version of Bouer and the libs of the cli ([`7c5c145`](https://github.com/bouerjs/cli/commit/7c5c14521b7a296fb2b0c1f8a70062423a4b3865))
* break: webpack completely reconfigured to match the new version of the libs, including bouer 3.3.0 ([`80f1d9e`](https://github.com/bouerjs/cli/commit/80f1d9edb3be190e72011164a1b2783dbeee8f4b))
* break: updated the dependencies and all the cli followed ([`50580a4`](https://github.com/bouerjs/cli/commit/50580a4944999dfb86a489e4dd2a71788e3ff449))
* break: added alias to the commands and ajusted the project and components creation to match the new version of Bouer and the libs of the cli ([`bf8aa61`](https://github.com/bouerjs/cli/commit/bf8aa617fc4a89ec2eea7f04f8bb0fcdd2852e5f))