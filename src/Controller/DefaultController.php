<?php

namespace App\Controller;

use App\Command\BusStop\ChangeBusStopGroupCommand;
use App\Command\BusStop\ChangeBusStopLocationCommand;
use App\Command\BusStop\CreateBusStopCommand;
use App\Command\BusStop\DeleteBusStopCommand;
use App\Command\BusStopGroup\CreateBusStopGroupCommand;
use App\Command\BusStopGroup\DeleteBusStopGroupCommand;
use App\Command\BusStopGroup\UpdateBusStopGroupCommand;
use App\Query\GetAllBusStopGroupsQuery;
use App\Query\GetAllBusStopsQuery;
use App\Query\GetBusStopGroupQuery;
use App\Query\GetBusStopQuery;
use CrEOF\Spatial\PHP\Types\Geometry\Point;
use Ramsey\Uuid\Uuid;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Routing\Annotation\Route;

class DefaultController extends Controller
{
    /**
     * @Route("/", name="homepage")
     */
    public function index(Request $request): Response
    {
        $data = [];
        return $this->render('default/index.html.twig', $data);
    }

    /**
     * @Route("/getAllBusStops", name="getAllBusStops")
     */
    public function getAllBusStops(Request $request, GetAllBusStopsQuery $query): Response
    {
        $data = $query();
        return new JsonResponse($data);
    }

    /**
     * @Route("/getBusStop", name="getBusStop")
     */
    public function getBusStop(Request $request, GetBusStopQuery $query): Response
    {
        $data = json_decode($request->getContent(), true);
        $id = Uuid::fromString($data['id']);
        $data = $query($id);
        return new JsonResponse($data);
    }

    /**
     * @Route("/createBusStop", name="createBusStop")
     */
    public function createBusStop(Request $request, MessageBusInterface $commandBus): Response
    {
        $data = json_decode($request->getContent(), true);
        $id = Uuid::uuid4();
        $location = $data['location'];
        $commandBus->dispatch(new CreateBusStopCommand($id, new Point($location[0], $location[1])));
        return new JsonResponse($id);
    }

    /**
     * @Route("/changeBusStopLocation", name="changeBusStopLocation")
     */
    public function changeBusStopLocation(Request $request, MessageBusInterface $commandBus): Response
    {
        $data = json_decode($request->getContent(), true);
        $id = Uuid::fromString($data['id']);
        $location = $data['location'];
        $commandBus->dispatch(new ChangeBusStopLocationCommand($id, new Point($location[0], $location[1])));
        return new JsonResponse($id);
    }

    /**
     * @Route("/changeBusStopGroup", name="changeBusStopGroup")
     */
    public function changeBusStopGroup(Request $request, MessageBusInterface $commandBus): Response
    {
        $data = json_decode($request->getContent(), true);
        $id = Uuid::fromString($data['id']);
        $group = $data['group'] ? Uuid::fromString($data['group']) : null;
        $commandBus->dispatch(new ChangeBusStopGroupCommand($id, $group));
        return new JsonResponse($id);
    }

    /**
     * @Route("/removeBusStop", name="removeBusStop")
     */
    public function removeBusStop(Request $request, MessageBusInterface $commandBus): Response
    {
        $data = json_decode($request->getContent(), true);
        $id = Uuid::fromString($data['id']);
        $commandBus->dispatch(new DeleteBusStopCommand($id));
        return new JsonResponse($id);
    }

    /**
     * @Route("/getAllBusStopGroups", name="getAllBusStopGroups")
     */
    public function getAllBusStopGroups(Request $request, GetAllBusStopGroupsQuery $query): Response
    {
        $data = $query();
        return new JsonResponse($data);
    }

    /**
     * @Route("/getBusStopGroup", name="getBusStopGroup")
     */
    public function getBusStopGroup(Request $request, GetBusStopGroupQuery $query): Response
    {
        $data = json_decode($request->getContent(), true);
        $id = Uuid::fromString($data['id']);
        $data = $query($id);
        return new JsonResponse($data);
    }

    /**
     * @Route("/createBusStopGroup", name="createBusStopGroup")
     */
    public function createBusStopGroup(Request $request, MessageBusInterface $commandBus): Response
    {
        $data = json_decode($request->getContent(), true);
        $id = Uuid::uuid4();
        $commandBus->dispatch(new CreateBusStopGroupCommand($id, $data['name']));
        foreach ($data['busStops'] as $busStop) {
            $commandBus->dispatch(new ChangeBusStopGroupCommand(Uuid::fromString($busStop), $id));
        }
        return new JsonResponse($id);
    }

    /**
     * @Route("/updateBusStopGroup", name="updateBusStopGroup")
     */
    public function updateBusStopGroup(Request $request, MessageBusInterface $commandBus): Response
    {
        $data = json_decode($request->getContent(), true);
        $id = Uuid::fromString($data['id']);
        $commandBus->dispatch(new UpdateBusStopGroupCommand($id, $data['name']));
        return new JsonResponse($id);
    }

    /**
     * @Route("/removeBusStopGroup", name="removeBusStopGroup")
     */
    public function removeBusStopGroup(Request $request, MessageBusInterface $commandBus): Response
    {
        $data = json_decode($request->getContent(), true);
        $id = Uuid::fromString($data['id']);
        $commandBus->dispatch(new DeleteBusStopGroupCommand($id));
        return new JsonResponse($id);
    }
}