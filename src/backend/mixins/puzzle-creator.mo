import Error "mo:core/Error";
import Types "../types";

mixin () {
  public shared func generatePersonalPuzzle(brief : Types.GenerationBrief) : async Text {
    ignore brief;
    throw Error.reject("Open Common Thread and sign in to use its Claude puzzle maker. Caffeine Inference is not used.");
  };
};
