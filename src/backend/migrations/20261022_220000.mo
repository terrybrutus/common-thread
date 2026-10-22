import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
module {
  public type OldActor = { accessControlState : AccessControl.AccessControlState };
  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    serviceSessions : Map.Map<Text, { owner : Principal; expires : Int }>;
  };
  public func migration(old : OldActor) : NewActor {
    { accessControlState = old.accessControlState; serviceSessions = Map.empty<Text, { owner : Principal; expires : Int }>() };
  };
};
