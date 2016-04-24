export default function toUUID(layerIdentifier) {
  return layerIdentifier.replace(/^layer:\/\/\/.+\//, '');
}
