import { Route, Switch, Redirect } from "wouter";
import { RoleProvider } from "./lib/role-context";
import { AppShell } from "./components/AppShell";
import Dashboard from "./pages/customer/Dashboard";
import Agents from "./pages/customer/Agents";
import Recordings from "./pages/customer/Recordings";
import Alerts from "./pages/customer/Alerts";
import Policies from "./pages/customer/Policies";
import Configuration from "./pages/customer/Configuration";
import License from "./pages/customer/License";
import HardwareBinding from "./pages/customer/HardwareBinding";
import LicenseMigration from "./pages/customer/LicenseMigration";
import Vault from "./pages/customer/Vault";
import Exports from "./pages/customer/Exports";
import ChainOfCustody from "./pages/customer/ChainOfCustody";
import Audit from "./pages/customer/Audit";
import Health from "./pages/customer/Health";
import Packages from "./pages/customer/Packages";
import RBAC from "./pages/customer/RBAC";
import KnowledgeBase from "./pages/KnowledgeBase";

export default function App() {
  return (
    <RoleProvider>
      <AppShell>
        <Switch>
          <Route path="/" component={() => <Redirect to="/dashboard" />} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/agents" component={Agents} />
          <Route path="/recordings" component={Recordings} />
          <Route path="/alerts" component={Alerts} />
          <Route path="/policies" component={Policies} />
          <Route path="/configuration" component={Configuration} />
          <Route path="/license" component={License} />
          <Route path="/hardware-binding" component={HardwareBinding} />
          <Route path="/license-migration" component={LicenseMigration} />
          <Route path="/vault" component={Vault} />
          <Route path="/exports" component={Exports} />
          <Route path="/chain-of-custody" component={ChainOfCustody} />
          <Route path="/audit" component={Audit} />
          <Route path="/health" component={Health} />
          <Route path="/packages" component={Packages} />
          <Route path="/rbac" component={RBAC} />
          <Route path="/knowledge-base" component={KnowledgeBase} />
          <Route component={() => <Redirect to="/dashboard" />} />
        </Switch>
      </AppShell>
    </RoleProvider>
  );
}
