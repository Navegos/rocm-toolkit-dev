# Contributing

## Adding new ROCm versions

All ROCm versions are visible on the
[NVIDIA ROCm toolkit archive](https://www.amd.com/en/developer/resources/rocm-hub/hip-sdk.html)

When adding new versions, the following files should be updated:

- `src/links/linux-links.ts`

  To get the linux link you should get the link for the `runfile (local)`
  option, the distribution doesn't matter as long as the architecture is
  `x86_64`, see the image below: ![Linux link copy](images/linux-link.jpg) Copy
  the link and paste it in a new entry of the `rocmVersionToURL` map:
  ![Linux link paste](images/linux-link-code.jpg)

- `src/links/windows-links.ts`

  There are two windows links, one for the network installer (online) and one
  for the local installer (offline):

  The installer links can be copied by selecting the Windows platform, OS
  version doesn't matter (at the time of writing), and then select either
  `exe (local)` for the local installer, and `exe (network)` for the online
  installer. The link can be copied by right clicking the green `Download`
  button and selecting `Copy Link address`.

  #### Windows - Local installer:

  ![Windows link local copy](images/windows-link-local.jpg)

  Then add a new entry in the `rocmVersionToURL` map with the link copied above:
  ![Windows link local paste](images/windows-link-local-code.jpg)

  #### Windows - Network installer:

  ![Windows link network copy](images/windows-link-network.jpg)

  Add a new entry in the `rocmVersionToNetworkUrl` map with the link copied in
  the above: ![Windows link network paste](images/windows-link-network-code.jpg)
