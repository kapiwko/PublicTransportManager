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
     * @Route("/getBusStops", name="getBusStops")
     */
    public function getBusStops(Request $request, GetBusStopQuery $query): Response
    {
        $data = [];
        foreach (json_decode($request->getContent(), true) as $id) {
            $data[] = $query(Uuid::fromString($id));
        }
        return new JsonResponse($data);
    }

    /**
     * @Route("/createBusStops", name="createBusStops")
     */
    public function createBusStops(Request $request, MessageBusInterface $commandBus): Response
    {
        $ids = [];
        foreach (json_decode($request->getContent(), true) as $data) {
            $id = Uuid::uuid4();
            $location = $data['location'];
            $commandBus->dispatch(new CreateBusStopCommand($id, new Point($location[0], $location[1])));
            $ids[] = $id;
        }
        return new JsonResponse($ids);
    }

    /**
     * @Route("/changeBusStopsLocation", name="changeBusStopsLocation")
     */
    public function changeBusStopsLocation(Request $request, MessageBusInterface $commandBus): Response
    {
        $ids = [];
        foreach (json_decode($request->getContent(), true) as $data) {
            $id = Uuid::fromString($data['id']);
            $location = $data['location'];
            $commandBus->dispatch(new ChangeBusStopLocationCommand($id, new Point($location[0], $location[1])));
            $ids[] = $id;
        }
        return new JsonResponse($ids);
    }

    /**
     * @Route("/changeBusStopsGroup", name="changeBusStopsGroup")
     */
    public function changeBusStopsGroup(Request $request, MessageBusInterface $commandBus): Response
    {
        $ids = [];
        foreach (json_decode($request->getContent(), true) as $data) {
            $id = Uuid::fromString($data['id']);
            $group = $data['group'] ? Uuid::fromString($data['group']) : null;
            $commandBus->dispatch(new ChangeBusStopGroupCommand($id, $group));
            $ids[] = $id;
        }
        return new JsonResponse($ids);
    }

    /**
     * @Route("/removeBusStops", name="removeBusStops")
     */
    public function removeBusStops(Request $request, MessageBusInterface $commandBus): Response
    {
        $ids = [];
        foreach (json_decode($request->getContent(), true) as $data) {
            $id = Uuid::fromString($data['id']);
            $commandBus->dispatch(new DeleteBusStopCommand($id));
            $ids[] = $id;
        }
        return new JsonResponse($ids);
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
     * @Route("/getBusStopGroups", name="getBusStopGroups")
     */
    public function getBusStopGroups(Request $request, GetBusStopGroupQuery $query): Response
    {
        $data = [];
        foreach (json_decode($request->getContent(), true) as $id) {
            $data[] = $query(Uuid::fromString($id));
        }
        return new JsonResponse($data);
    }

    /**
     * @Route("/createBusStopGroups", name="createBusStopGroups")
     */
    public function createBusStopGroups(Request $request, MessageBusInterface $commandBus): Response
    {
        $ids = [];
        foreach (json_decode($request->getContent(), true) as $data) {
            $id = Uuid::uuid4();
            $commandBus->dispatch(new CreateBusStopGroupCommand($id, $data['name']));
            foreach ($data['busStops'] as $busStop) {
                $commandBus->dispatch(new ChangeBusStopGroupCommand(Uuid::fromString($busStop), $id));
            }
            $ids[] = $id;
        }
        return new JsonResponse($ids);
    }

    /**
     * @Route("/updateBusStopGroups", name="updateBusStopGroups")
     */
    public function updateBusStopGroups(Request $request, MessageBusInterface $commandBus): Response
    {
        $ids = [];
        foreach (json_decode($request->getContent(), true) as $data) {
            $id = Uuid::fromString($data['id']);
            $commandBus->dispatch(new UpdateBusStopGroupCommand($id, $data['name']));
            $ids[] = $id;
        }
        return new JsonResponse($ids);
    }

    /**
     * @Route("/removeBusStopGroups", name="removeBusStopGroups")
     */
    public function removeBusStopGroups(Request $request, MessageBusInterface $commandBus): Response
    {
        $ids = [];
        foreach (json_decode($request->getContent(), true) as $data) {
            $id = Uuid::fromString($data['id']);
            $commandBus->dispatch(new DeleteBusStopGroupCommand($id));
            $ids[] = $id;
        }
        return new JsonResponse($ids);
    }
}